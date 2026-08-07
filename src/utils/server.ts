{
  "info": {
    "_postman_id": "6358d16c-0af7-4803-afea-f07f5d213381",
    "name": "GearUP",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "23351471",
    "_collection_link": "https://go.postman.co/collection/23351471-6358d16c-0af7-4803-afea-f07f5d213381?source=collection_link"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\r\n  \"name\": \"Domrn Doess\",\r\n  \"email\": \"rahul@email.com\",\r\n  \"password\": \"Password123\",\r\n  \"role\": \"PROVIDER\"\r\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:3000/api/auth/register",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "3000",
              "path": [
                "api",
                "auth",
                "register"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\r\n  \r\n  \"email\": \"Domen.doe@email.com\",\r\n  \"password\": \"Password123\"\r\n  \r\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "https://assignment-4-six-omega.vercel.app/api/auth/login",
              "protocol": "https",
              "host": [
                "assignment-4-six-omega",
                "vercel",
                "app"
              ],
              "path": [
                "api",
                "auth",
                "login"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Me",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "{{json_web_token_0j9y}}",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:3000/api/auth/me",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "3000",
              "path": [
                "api",
                "auth",
                "me"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Gear",
      "item": [
        {
          "name": "Create Gear",
          "request": {
            "method": "POST",
            "header": []
          },
          "response": []
        },
        {
          "name": "Get All Gear",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Get Single Gear Item",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Get My Gear",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Update Gear",
          "request": {
            "method": "PUT",
            "header": []
          },
          "response": []
        },
        {
          "name": "Delete Gear",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        }
      ]
    },
    {
      "name": "Categories",
      "item": [
        {
          "name": "Get All Categories",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "https://assignment-4-six-omega.vercel.app/api/categories",
              "protocol": "https",
              "host": [
                "assignment-4-six-omega",
                "vercel",
                "app"
              ],
              "path": [
                "api",
                "categories"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Get Single Categories",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Create Categories",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Update Categories",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Delete Category",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        }
      ]
    },
    {
      "name": "Rental",
      "item": [
        {
          "name": "Create Rental Order",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "{{supabase_service_role_api_key_03cx}}",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "https://assignment-4-six-omega.vercel.app/api/rentals",
              "protocol": "https",
              "host": [
                "assignment-4-six-omega",
                "vercel",
                "app"
              ],
              "path": [
                "api",
                "rentals"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Get My Rentals",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Get Incoming Rentals",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Get Rental By Id",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Cancel",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Update Rental Status",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        }
      ]
    },
    {
      "name": "Payment",
      "item": [
        {
          "name": "Create Payment",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Get My Payment",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Get Payment Details",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "{{json_web_token_041c}}",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "https://assignment-4-six-omega.vercel.app/api/payments/60ac58a5-ac3e-49e8-8e0c-47f2ca5b31d4",
              "protocol": "https",
              "host": [
                "assignment-4-six-omega",
                "vercel",
                "app"
              ],
              "path": [
                "api",
                "payments",
                "60ac58a5-ac3e-49e8-8e0c-47f2ca5b31d4"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Review",
      "item": [
        {
          "name": "New Request",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        }
      ]
    },
    {
      "name": "Admin",
      "item": [
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Get Single User",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Change User Status",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "Get All Rentals",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        },
        {
          "name": "New Request",
          "request": {
            "method": "GET",
            "header": []
          },
          "response": []
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "json_web_token_0x1r",
      "secret": true
    },
    {
      "key": "json_web_token_0j9y",
      "secret": true
    },
    {
      "key": "supabase_service_role_api_key_03cx",
      "secret": true
    },
    {
      "key": "json_web_token_041c",
      "secret": true
    }
  ]
}