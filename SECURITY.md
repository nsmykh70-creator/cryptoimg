# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in Cryptoimg, please report it responsibly:

- **Email**: Create an issue at https://github.com/nsmykh70-creator/cryptoimg/issues
- **Do NOT** disclose vulnerabilities publicly until a fix is available.

## Security Design

Cryptoimg is designed with a zero-knowledge architecture:

1. **No server communication**: All cryptographic operations run client-side in your browser
2. **No telemetry**: No data is collected, logged, or transmitted
3. **No backdoor**: Lost PIN = lost data. This is intentional.
4. **Authenticated encryption**: AES-256-GCM detects any tampering with the encrypted data
5. **Memory-hard KDF**: Argon2id makes brute-force attacks computationally expensive

## Cryptographic Algorithms

| Algorithm | Purpose | Standard |
|-----------|---------|----------|
| Argon2id | Key derivation from PIN | RFC 9106 |
| AES-256-GCM | Authenticated encryption | NIST SP 800-38D |
| HKDF-SHA256 | Key expansion | RFC 5869 |
| Reed-Solomon | Error correction | GF(2^8) |

## Known Limitations

- **Steganographic detection**: No steganography is truly undetectable against a determined adversary with access to the original image
- **Social media**: Re-compression by social platforms destroys hidden data. Use lossless transfer methods.
- **PIN recovery**: There is no way to recover data if the PIN is lost. This is by design.

## WebAssembly Security

The cryptographic operations use WebAssembly modules compiled from verified C/Rust source code via [hash-wasm](https://github.com/nicolo-ribaudo/hash-wasm). The WASM modules are served alongside the application and executed entirely in the browser sandbox.

## Browser Security

Cryptoimg relies on browser security features:

- **Web Crypto API**: For secure random number generation
- **WebAssembly sandbox**: For memory isolation
- **Same-origin policy**: Prevents cross-origin data access
- **CSP headers**: The server deploys with strict Content Security Policy headers
