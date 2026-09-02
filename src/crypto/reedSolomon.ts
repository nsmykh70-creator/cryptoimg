const COEFFICIENTS_ZERO = new Int32Array([0]);
const COEFFICIENTS_ONE = new Int32Array([1]);

export class Generic_GF_Poly {
  field: Generic_GF;
  coefficients: Int32Array;
  degree: number;

  constructor(field: Generic_GF, coefficients: Int32Array) {
    if (coefficients.length === 0) {
      throw new Error('IllegalArgumentException()');
    }
    this.field = field;
    const len = coefficients.length;
    if (len > 1 && coefficients[0] === 0) {
      let firstNonZero = 1;
      while (firstNonZero < len && coefficients[firstNonZero] === 0) {
        firstNonZero++;
      }
      if (firstNonZero === len) {
        this.coefficients = COEFFICIENTS_ZERO;
      } else {
        this.coefficients = coefficients.subarray(firstNonZero, len);
      }
    } else {
      this.coefficients = coefficients;
    }
    this.degree = this.coefficients.length - 1;
  }

  is_zero(): boolean {
    return this.coefficients[0] === 0;
  }

  get_coefficient(degree: number): number {
    return this.coefficients[this.coefficients.length - 1 - degree];
  }

  evaluate_at(a: number): number {
    if (a === 0) {
      return this.get_coefficient(0);
    }
    const coefficients = this.coefficients;
    const size = coefficients.length;
    if (a === 1) {
      let result = 0;
      for (let i = 0; i < size; i++) {
        result = Generic_GF.add_or_subtract(result, coefficients[i]);
      }
      return result;
    }
    let result = coefficients[0];
    for (let i = 1; i < size; i++) {
      result = Generic_GF.add_or_subtract(this.field.multiply(a, result), coefficients[i]);
    }
    return result;
  }

  add_or_subtract(other: Generic_GF_Poly, buf?: Int32Array): Generic_GF_Poly {
    if (this.field !== other.field) {
      throw new Error('GenericGFPolys do not have same GenericGF field');
    }
    if (this.is_zero()) {
      return other;
    }
    if (other.is_zero()) {
      return this;
    }
    let smaller = this.coefficients;
    let larger = other.coefficients;
    if (smaller.length > larger.length) {
      const temp = smaller;
      smaller = larger;
      larger = temp;
    }
    const sumDiff = buf ? buf.subarray(0, larger.length) : new Int32Array(larger.length);
    const lengthDiff = larger.length - smaller.length;
    for (let i = lengthDiff; i < larger.length; i++) {
      sumDiff[i] = Generic_GF.add_or_subtract(smaller[i - lengthDiff], larger[i]);
    }
    sumDiff.set(larger.subarray(0, lengthDiff));
    return new Generic_GF_Poly(this.field, sumDiff);
  }

  multiply(other: Generic_GF_Poly | number): Generic_GF_Poly {
    if (typeof other === 'number') {
      return this.multiply_scalar(other);
    }
    return this.multiply_poly(other);
  }

  multiply_poly(other: Generic_GF_Poly): Generic_GF_Poly {
    if (this.field !== other.field) {
      throw new Error('GenericGFPolys do not have same GenericGF field');
    }
    if (this.is_zero() || other.is_zero()) {
      return this.field.zero;
    }
    const aCoeffs = this.coefficients;
    const aLen = aCoeffs.length;
    const bCoeffs = other.coefficients;
    const bLen = bCoeffs.length;
    const product = new Int32Array(aLen + bLen - 1);
    for (let i = 0; i < aLen; i++) {
      const aCoeff = aCoeffs[i];
      for (let j = 0; j < bLen; j++) {
        product[i + j] = Generic_GF.add_or_subtract(product[i + j], this.field.multiply(aCoeff, bCoeffs[j]));
      }
    }
    return new Generic_GF_Poly(this.field, product);
  }

  multiply_scalar(scalar: number): Generic_GF_Poly {
    if (scalar === 0) return this.field.zero;
    if (scalar === 1) return this;
    const size = this.coefficients.length;
    const product = new Int32Array(size);
    for (let i = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], scalar);
    }
    return new Generic_GF_Poly(this.field, product);
  }

  multiply_by_monomial(degree: number, coefficient: number): Generic_GF_Poly {
    if (degree < 0) throw new Error('IllegalArgumentException()');
    if (coefficient === 0) return this.field.zero;
    const size = this.coefficients.length;
    const product = new Int32Array(size + degree);
    for (let i = 0; i < size; i++) {
      product[i] = this.field.multiply(this.coefficients[i], coefficient);
    }
    return new Generic_GF_Poly(this.field, product);
  }

  divide(other: Generic_GF_Poly): [Generic_GF_Poly, Generic_GF_Poly] {
    if (this.field !== other.field) throw new Error('GenericGFPolys do not have same GenericGF field');
    if (other.is_zero()) throw new Error('Divide by 0');
    let quotient = this.field.zero;
    let remainder: Generic_GF_Poly = this;
    const denominatorLeadingTerm = other.get_coefficient(other.degree);
    const inverseDenominator = this.field.inverse(denominatorLeadingTerm);
    while (remainder.degree >= other.degree && !remainder.is_zero()) {
      const degreeDiff = remainder.degree - other.degree;
      const scale = this.field.multiply(remainder.get_coefficient(remainder.degree), inverseDenominator);
      const term = other.multiply_by_monomial(degreeDiff, scale);
      const iterationQuotient = this.field.build_monomial(degreeDiff, scale);
      quotient = quotient.add_or_subtract(iterationQuotient, quotient.coefficients);
      remainder = remainder.add_or_subtract(term, remainder.coefficients);
    }
    return [quotient, remainder];
  }
}

export class Generic_GF {
  primitive: number;
  size: number;
  generator_base: number;
  exp_table: Int32Array;
  log_table: Int32Array;
  zero: Generic_GF_Poly;
  one: Generic_GF_Poly;

  constructor(primitive: number, size: number, generator_base: number) {
    this.primitive = primitive;
    this.size = size;
    this.generator_base = generator_base;
    this.exp_table = new Int32Array(size);
    this.log_table = new Int32Array(size);
    let x = 1;
    for (let i = 0; i < size; i++) {
      this.exp_table[i] = x;
      x *= 2;
      if (x >= size) {
        x ^= primitive;
        x &= size - 1;
      }
    }
    for (let i = 0; i < size - 1; i++) {
      this.log_table[this.exp_table[i]] = i;
    }
    this.zero = new Generic_GF_Poly(this, COEFFICIENTS_ZERO);
    this.one = new Generic_GF_Poly(this, COEFFICIENTS_ONE);
  }

  static add_or_subtract(a: number, b: number): number {
    return a ^ b;
  }

  build_monomial(degree: number, coefficient: number): Generic_GF_Poly {
    if (degree < 0) throw new Error('IllegalArgumentException()');
    if (coefficient === 0) return this.zero;
    const coefficients = new Int32Array(degree + 1);
    coefficients[0] = coefficient;
    return new Generic_GF_Poly(this, coefficients);
  }

  exp(a: number): number {
    return this.exp_table[a];
  }

  log(a: number): number {
    if (a === 0) throw new Error('IllegalArgumentException()');
    return this.log_table[a];
  }

  inverse(a: number): number {
    if (a === 0) throw new Error('ArithmeticException()');
    return this.exp_table[this.size - this.log_table[a] - 1];
  }

  multiply(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.exp_table[(this.log_table[a] + this.log_table[b]) % (this.size - 1)];
  }
}

export class RS_Encoder {
  field: Generic_GF;
  cached_generators: Generic_GF_Poly[];

  constructor(field: Generic_GF) {
    this.field = field;
    this.cached_generators = [new Generic_GF_Poly(field, new Int32Array([1]))];
  }

  build_generator(degree: number): Generic_GF_Poly {
    if (degree >= this.cached_generators.length) {
      let lastGen = this.cached_generators[this.cached_generators.length - 1];
      for (let d = this.cached_generators.length; d <= degree; d++) {
        const nextGen = lastGen.multiply(new Generic_GF_Poly(this.field, new Int32Array([1, this.field.exp(d - 1 + this.field.generator_base)])));
        this.cached_generators.push(nextGen);
        lastGen = nextGen;
      }
    }
    return this.cached_generators[degree];
  }

  encode(data: Int32Array, ec_bytes: number): void {
    if (ec_bytes === 0) throw new Error('No error correction bytes');
    const data_bytes = data.length - ec_bytes;
    if (data_bytes <= 0) throw new Error('No data bytes provided');
    const generator = this.build_generator(ec_bytes);
    const infoCoeffs = new Int32Array(data_bytes);
    infoCoeffs.set(data.subarray(0, data_bytes));
    let info = new Generic_GF_Poly(this.field, infoCoeffs);
    info = info.multiply_by_monomial(ec_bytes, 1);
    const remainder = info.divide(generator)[1];
    const coefficients = remainder.coefficients;
    const numZero = ec_bytes - coefficients.length;
    for (let i = 0; i < numZero; i++) {
      data[data_bytes + i] = 0;
    }
    data.set(coefficients.subarray(0, coefficients.length), data_bytes + numZero);
  }
}

export class RS_Decoder {
  field: Generic_GF;

  constructor(field: Generic_GF) {
    this.field = field;
  }

  decode(received: Int32Array, ec_bytes: number): void {
    const poly = new Generic_GF_Poly(this.field, received);
    const syndromeCoeffs = new Int32Array(ec_bytes);
    let noError = true;
    for (let i = 0; i < ec_bytes; i++) {
      const evalRes = poly.evaluate_at(this.field.exp(i + this.field.generator_base));
      syndromeCoeffs[syndromeCoeffs.length - 1 - i] = evalRes;
      if (evalRes !== 0) noError = false;
    }
    if (noError) return;

    const syndrome = new Generic_GF_Poly(this.field, syndromeCoeffs);
    const sigmaOmega = this.run_euclidean_algorithm(this.field.build_monomial(ec_bytes, 1), syndrome, ec_bytes);
    const sigma = sigmaOmega[0];
    const omega = sigmaOmega[1];
    const errorLocations = this.find_error_locations(sigma);
    const errorMagnitudes = this.find_error_magnitudes(omega, errorLocations);

    for (let i = 0; i < errorLocations.length; i++) {
      const position = received.length - 1 - this.field.log(errorLocations[i]);
      if (position < 0) throw new Error('Bad error location');
      received[position] = Generic_GF.add_or_subtract(received[position], errorMagnitudes[i]);
    }
  }

  private run_euclidean_algorithm(a: Generic_GF_Poly, b: Generic_GF_Poly, R: number): [Generic_GF_Poly, Generic_GF_Poly] {
    let a_ = a;
    let b_ = b;
    if (a_.degree < b_.degree) {
      const temp = a_;
      a_ = b_;
      b_ = temp;
    }
    let r_last = a_;
    let r = b_;
    let t_last = this.field.zero;
    let t = this.field.one;
    while (r.degree >= R / 2) {
      const r_last_last = r_last;
      const t_last_last = t_last;
      r_last = r;
      t_last = t;
      if (r_last.is_zero()) throw new Error('r_{i-1} was zero');
      r = r_last_last;
      let q = this.field.zero;
      const denomLeading = r_last.get_coefficient(r_last.degree);
      const dltInverse = this.field.inverse(denomLeading);
      while (r.degree >= r_last.degree && !r.is_zero()) {
        const degreeDiff = r.degree - r_last.degree;
        const scale = this.field.multiply(r.get_coefficient(r.degree), dltInverse);
        q = q.add_or_subtract(this.field.build_monomial(degreeDiff, scale));
        r = r.add_or_subtract(r_last.multiply_by_monomial(degreeDiff, scale));
      }
      t = q.multiply(t_last).add_or_subtract(t_last_last);
    }
    const sigmaTildeZero = t.get_coefficient(0);
    if (sigmaTildeZero === 0) throw new Error('sigmaTilde(0) was zero');
    const inv = this.field.inverse(sigmaTildeZero);
    const sigma = t.multiply(inv);
    const omega = r.multiply(inv);
    return [sigma, omega];
  }

  private find_error_locations(errorLocator: Generic_GF_Poly): Int32Array {
    const numErrors = errorLocator.degree;
    if (numErrors === 1) {
      return new Int32Array([errorLocator.get_coefficient(1)]);
    }
    const result = new Int32Array(numErrors);
    let e = 0;
    for (let i = 1; i < this.field.size && e < numErrors; i++) {
      if (errorLocator.evaluate_at(i) === 0) {
        result[e] = this.field.inverse(i);
        e++;
      }
    }
    if (e !== numErrors) throw new Error('Error locator degree does not match number of roots');
    return result;
  }

  private find_error_magnitudes(errorEvaluator: Generic_GF_Poly, errorLocations: Int32Array): Int32Array {
    const s = errorLocations.length;
    const result = new Int32Array(s);
    for (let i = 0; i < s; i++) {
      const xiInverse = this.field.inverse(errorLocations[i]);
      let denom = 1;
      for (let j = 0; j < s; j++) {
        if (i !== j) {
          denom = this.field.multiply(denom, Generic_GF.add_or_subtract(1, this.field.multiply(errorLocations[j], xiInverse)));
        }
      }
      result[i] = this.field.multiply(errorEvaluator.evaluate_at(xiInverse), this.field.inverse(denom));
      if (this.field.generator_base !== 0) {
        result[i] = this.field.multiply(result[i], xiInverse);
      }
    }
    return result;
  }
}

let _gf_qr_code_256: Generic_GF | null = null;
export function GF_QR_CODE_256(): Generic_GF {
  if (!_gf_qr_code_256) {
    _gf_qr_code_256 = new Generic_GF(0x011d, 256, 0);
  }
  return _gf_qr_code_256;
}
