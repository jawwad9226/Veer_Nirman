from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional
import json
import hashlib

# Security setup
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

router = APIRouter()

# User data models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    unit: str
    role: str = "cadet"
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    unit: str
    role: str
    phone: Optional[str] = None
    created_at: str
    last_login: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Simple file-based user storage (replace with real database in production)
USERS_FILE = "data/users.json"

def ensure_data_dir():
    """Ensure data directory exists"""
    os.makedirs("data", exist_ok=True)

def load_users():
    """Load users from JSON file"""
    ensure_data_dir()
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_users(users):
    """Save users to JSON file"""
    ensure_data_dir()
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def verify_password(plain_password, hashed_password):
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hash a password"""
    return pwd_context.hash(password)

def get_user(email: str):
    """Get user by email"""
    users = load_users()
    return users.get(email)

def authenticate_user(email: str, password: str):
    """Authenticate user with email and password"""
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    """Register a new user"""
    users = load_users()
    
    # Check if user already exists
    if user.email in users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate user ID
    user_id = hashlib.md5(user.email.encode()).hexdigest()
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Create user record
    user_data = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "unit": user.unit,
        "role": user.role,
        "phone": user.phone,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None
    }
    
    # Save user
    users[user.email] = user_data
    save_users(users)

    # Initialize progress for this user (per-cadet progress tracking)
    try:
        from routers.progress import initialize_progress_for_user
        initialize_progress_for_user(user_id)
    except Exception as e:
        print(f"[WARN] Could not initialize progress for user {user_id}: {e}")

    # Return user data (without password)
    return UserResponse(**{k: v for k, v in user_data.items() if k != "hashed_password"})

@router.post("/login", response_model=Token)
async def login_user(form_data: UserLogin):
    """Login user and return access token"""
    user = authenticate_user(form_data.email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    users = load_users()
    users[form_data.email]["last_login"] = datetime.utcnow().isoformat()
    save_users(users)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(**{k: v for k, v in current_user.items() if k != "hashed_password"})

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update current user profile"""
    users = load_users()
    email = current_user["email"]
    
    # Update allowed fields
    allowed_fields = ["name", "unit", "phone"]
    for field in allowed_fields:
        if field in user_update:
            users[email][field] = user_update[field]
    
    save_users(users)
    
    return UserResponse(**{k: v for k, v in users[email].items() if k != "hashed_password"})

@router.post("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify if token is valid"""
    return {"valid": True, "user": UserResponse(**{k: v for k, v in current_user.items() if k != "hashed_password"})}

@router.post("/logout")
async def logout():
    """Logout user (client should remove token)"""
    return {"message": "Successfully logged out"}
