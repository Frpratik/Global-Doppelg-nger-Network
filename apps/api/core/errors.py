"""
DOPPEL Error Handlers and Custom Exceptions
"""
from typing import Any, Optional, Dict
from fastapi import HTTPException, status
from packages.shared.constants import ErrorCode

class DoppelException(HTTPException):
    def __init__(
        self,
        status_code: int,
        error_code: ErrorCode,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "success": False,
                "error": {
                    "code": error_code.value,
                    "message": message,
                    "details": details or {},
                    "request_id": request_id
                }
            }
        )
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        self.request_id = request_id


class AuthenticationError(DoppelException):
    def __init__(self, message: str = "Invalid authentication credentials", error_code: ErrorCode = ErrorCode.AUTH_INVALID_CREDENTIALS):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code=error_code,
            message=message
        )


class PermissionDeniedError(DoppelException):
    def __init__(self, message: str = "Permission denied", error_code: ErrorCode = ErrorCode.FORBIDDEN):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=error_code,
            message=message
        )


class ConsentRequiredError(DoppelException):
    def __init__(self, message: str = "Biometric processing consent required", error_code: ErrorCode = ErrorCode.CONSENT_BIOMETRIC_REQUIRED):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=error_code,
            message=message
        )


class FaceQualityError(DoppelException):
    def __init__(self, message: str, error_code: ErrorCode, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code=error_code,
            message=message,
            details=details
        )


class NotFoundError(DoppelException):
    def __init__(self, message: str = "Resource not found", error_code: ErrorCode = ErrorCode.NOT_FOUND):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code=error_code,
            message=message
        )


class RateLimitError(DoppelException):
    def __init__(self, message: str = "Too many requests. Please slow down."):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code=ErrorCode.RATE_LIMIT_EXCEEDED,
            message=message
        )
