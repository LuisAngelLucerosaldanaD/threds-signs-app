import {KEYUTIL, RSAKey, KJUR} from 'jsrsasign';

export class Cipher {

  private keyRsaStr: string = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtQY+OUzE8WqezBoczCsN
HxOyStMv9xW2qVU4GccSRRq5p5UWdmShFWlzAfFut5mwk1El8D8rUeaJLQX44nQU
fBeiym9oyYOEhJSpaFQz7Cac8BJxcwntz2D7XJaTT0pP2t6yGaCzpdxRIBu1xyWs
IcRvWb57UTSSE8MvxmtnLHx6XM1YeRwD+2Bh84LC7IxYrzGz5Sb41NO2V1cG/6qt
h6N7fNaVTx3KawtNWJ6X3R5U+PPsjO8cRTaQY09fnCa/GkiuIMRnyJughkebTgL6
64KZEivJcyN/HR6sh3h+2KzMiwWw/1LnraM4eriPyZzQy9kj26qmUNUbotxfnkWL
eQIDAQAB
-----END PUBLIC KEY-----
`;
  private readonly keyRsa: RSAKey;
  private readonly keyJwk: KJUR.jws.JWS.JsonWebKey;
  private key: any;

  /**
   * Constructor de la clase Cipher.
   * Inicializa la llave RSA a partir de una cadena de texto.
   * Convierte la llave RSA a formato JWK (JSON Web Key).
   * Importa la llave pública para su uso posterior.
   */
  constructor() {
    this.keyRsa = KEYUTIL.getKey(this.keyRsaStr) as RSAKey;
    this.keyJwk = KEYUTIL.getJWKFromKey(this.keyRsa);
    this.importPublicKey().catch(err => console.log(err));
  }

  /**
   * Importa una llave pública utilizando el formato JWK (JSON Web Key) y la almacena en la variable `key`.
   * Esta llave se utilizará para encriptar datos utilizando el algoritmo RSA-OAEP.
   *
   * @returns {Promise<void>} - No retorna ningún valor.
   */
  private async importPublicKey(): Promise<void> {
    this.key = await window.crypto.subtle.importKey(
      'jwk',
      this.keyJwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt'],
    );
  }

  /**
   * Encripta un texto utilizando el algoritmo RSA-OAEP.
   *
   * @param {string} data - El texto que se desea encriptar.
   * @returns {Promise<string>} - Retorna el texto encriptado en formato base64.
   */
  public async encryptText(data: string): Promise<string> {
    const enc = new TextEncoder();
    const encoded = enc.encode(data);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      this.key,
      encoded,
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  /**
   * Verifica la firma de un JWT (JSON Web Token) utilizando la llave RSA.
   *
   * @param {string} jwt - El JWT que se desea verificar.
   * @returns {boolean} - Retorna `true` si el JWT es válido y `false` en caso contrario.
   */
  public verifyJWT(jwt: string): boolean {
    return KJUR.jws.JWS.verify(jwt, this.keyRsa, ['RS256']);
  }
}
