import os
from dotenv import load_dotenv

load_dotenv()  # carga variables del .env

SIOMA_API_BASE = os.getenv("SIOMA_API_BASE")
SIOMA_API_KEY = os.getenv("SIOMA_API_KEY")

print("SIOMA_API_BASE:", SIOMA_API_BASE)
print("SIOMA_API_KEY:", SIOMA_API_KEY)
