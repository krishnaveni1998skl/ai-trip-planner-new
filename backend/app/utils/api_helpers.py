import asyncio
import httpx


# =========================================================
# SAFE GET REQUEST
# =========================================================

async def safe_get(
    url: str,
    params: dict | None = None,
    headers: dict | None = None,
    timeout: float = 10.0,
    retries: int = 1,
):
    for attempt in range(retries + 1):

        try:
            async with httpx.AsyncClient(
                timeout=timeout
            ) as client:

                response = await client.get(
                    url,
                    params=params,
                    headers=headers,
                )

                # Rate limit
                if response.status_code == 429:
                    return {
                        "success": False,
                        "error_type": "rate_limit",
                        "status_code": 429,
                        "message": (
                            "API rate limit reached."
                        ),
                    }

                # Server error → retry
                if response.status_code >= 500:

                    if attempt < retries:
                        await asyncio.sleep(1)
                        continue

                    return {
                        "success": False,
                        "error_type": "server_error",
                        "status_code": response.status_code,
                        "message": (
                            "External service is "
                            "temporarily unavailable."
                        ),
                    }

                # Client error
               # Client error
            if response.status_code >= 400:
                try:
                   error_body = response.json()
                except Exception:
                  error_body = response.text

                print("\n========================================")
                print("EXTERNAL API ERROR")
                print("========================================")
                print(f"Status Code : {response.status_code}")
                print(f"Response    : {error_body}")
                print("========================================\n")

                return {
        "success": False,
        "error_type": "http_error",
        "status_code": response.status_code,
        "message": f"API request failed with status {response.status_code}.",
        "details": error_body,
    } 

                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data": response.json(),
                }

        except httpx.TimeoutException:

            if attempt < retries:
                await asyncio.sleep(1)
                continue

            return {
                "success": False,
                "error_type": "timeout",
                "message": (
                    "API request timed out."
                ),
            }

        except httpx.RequestError as e:

            if attempt < retries:
                await asyncio.sleep(1)
                continue

            return {
                "success": False,
                "error_type": "connection_error",
                "message": str(e),
            }

        except Exception as e:

            return {
                "success": False,
                "error_type": "unexpected_error",
                "message": str(e),
            }

    return {
        "success": False,
        "error_type": "unknown",
        "message": "Unable to complete API request.",
    }


# =========================================================
# SAFE POST REQUEST
# =========================================================

async def safe_post(
    url: str,
    data: dict | None = None,
    headers: dict | None = None,
    timeout: float = 10.0,
    retries: int = 1,
):
    for attempt in range(retries + 1):

        try:
            async with httpx.AsyncClient(
                timeout=timeout
            ) as client:

                response = await client.post(
                    url,
                    data=data,
                    headers=headers,
                )

                # Rate limit
                if response.status_code == 429:
                    return {
                        "success": False,
                        "error_type": "rate_limit",
                        "status_code": 429,
                        "message": (
                            "API rate limit reached."
                        ),
                    }

                # Server error → retry
                if response.status_code >= 500:

                    if attempt < retries:
                        await asyncio.sleep(1)
                        continue

                    return {
                        "success": False,
                        "error_type": "server_error",
                        "status_code": response.status_code,
                        "message": (
                            "External service is "
                            "temporarily unavailable."
                        ),
                    }

                # Client error
                if response.status_code >= 400:
                    return {
                        "success": False,
                        "error_type": "http_error",
                        "status_code": response.status_code,
                        "message": (
                            "API request failed."
                        ),
                    }

                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data": response.json(),
                }

        except httpx.TimeoutException:

            if attempt < retries:
                await asyncio.sleep(1)
                continue

            return {
                "success": False,
                "error_type": "timeout",
                "message": (
                    "API request timed out."
                ),
            }

        except httpx.RequestError as e:

            if attempt < retries:
                await asyncio.sleep(1)
                continue

            return {
                "success": False,
                "error_type": "connection_error",
                "message": str(e),
            }

        except Exception as e:

            return {
                "success": False,
                "error_type": "unexpected_error",
                "message": str(e),
            }

    return {
        "success": False,
        "error_type": "unknown",
        "message": "Unable to complete API request.",
    }