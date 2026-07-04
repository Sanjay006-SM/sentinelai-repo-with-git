import base64
import json
from cryptography.fernet import Fernet
from app.core.config import settings

def _get_fernet() -> Fernet:
    """
    Creates a Fernet instance using the SECRET_KEY from settings.
    If the key is not exactly 32 url-safe base64-encoded bytes, it pads/truncates it.
    """
    secret = settings.SECRET_KEY.encode('utf-8')
    # Fernet requires a 32-byte key encoded in base64.
    # We hash or pad the secret key to 32 bytes to ensure it's valid for Fernet.
    import hashlib
    key = hashlib.sha256(secret).digest()
    b64_key = base64.urlsafe_b64encode(key)
    return Fernet(b64_key)

def encrypt_credentials(credentials_dict: dict) -> str:
    """
    Encrypts a dictionary of credentials into a secure string.
    """
    fernet = _get_fernet()
    json_bytes = json.dumps(credentials_dict).encode('utf-8')
    encrypted_bytes = fernet.encrypt(json_bytes)
    return encrypted_bytes.decode('utf-8')

def decrypt_credentials(encrypted_str: str) -> dict:
    """
    Decrypts the secure string back into a dictionary of credentials.
    """
    if not encrypted_str:
        return {}
    fernet = _get_fernet()
    try:
        decrypted_bytes = fernet.decrypt(encrypted_str.encode('utf-8'))
        return json.loads(decrypted_bytes.decode('utf-8'))
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to decrypt credentials: {e}")
        return {}
