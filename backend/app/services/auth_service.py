from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import Token
from app.schemas.user import UserCreate


class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repository = UserRepository(db)

    async def register_user(self, payload: UserCreate):
        existing_user = await self.user_repository.get_by_email(payload.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )

        hashed_password = hash_password(payload.password)

        return await self.user_repository.create(
            email=payload.email,
            hashed_password=hashed_password,
            full_name=payload.full_name,
        )

    async def login_user(self, email: str, password: str) -> Token:
        user = await self.user_repository.get_by_email(email)

        if user is None or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = create_access_token(subject=str(user.id))
        return Token(access_token=token)