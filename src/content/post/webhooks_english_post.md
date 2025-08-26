---
title: "Webhooks That Don't Whiplash: Idempotency, Retries & Signatures"
publishDate: '30 January 2023'
description: 'Learn how to build robust webhook systems with idempotency, smart retries, and signature verification to prevent duplicate processing and security issues'
tags: ['webhooks', 'api', 'backend', 'idempotency', 'security', 'aws']
---

# Webhooks That Don't Whiplash: Idempotency, Retries & Signatures

## 🎯 Introduction (1 min)

> "Webhooks are like your house doorbell: they notify you when something important happens, but if you're not home, what happens?"

**What are webhooks?**

- Automatic notifications between systems
- "Don't call us, we'll call you"
- Real-time events: payments, registrations, updates

## 🔄 The "Whiplash" Problem (2 mins)

### Without Best Practices:

```
Webhook fails → Gets resent → We process twice → 💥 Customer charged double
```

### Real-World Scenarios:

- **Duplicate payment**: Stripe webhook processed twice
- **Email spam**: Registration notification sent multiple times
- **Incorrect inventory**: Stock updated several times

## 🛡️ The 3 Defenses Against Whiplash (5 mins)

### 1. **Idempotency** 🔑

> "The same event, processed N times = same result"

```python
# ❌ Bad example
def process_payment(amount):
    balance += amount  # Adds every time!

# ✅ Good example
def process_payment(webhook_id, amount):
    if not already_processed(webhook_id):
        balance += amount
        mark_as_processed(webhook_id)
```

**Key:** Use a unique ID (webhook_id) to track already processed events.

### 2. **Smart Retries** 🔄

> "If it doesn't work the first time, try again... but with class"

**Exponential Backoff Strategy:**

```
Attempt 1: Immediate
Attempt 2: 2 seconds
Attempt 3: 4 seconds
Attempt 4: 8 seconds
Attempt 5: 16 seconds → Dead Letter Queue
```

**Important response codes:**

- `200`: ✅ Success, don't retry
- `4xx`: ❌ Client error, don't retry
- `5xx`: 🔄 Server error, retry

### 3. **Signatures** 🔐

> "How do I know this webhook really comes from where it claims?"

```python
# Signature verification (Stripe example)
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

**Why is it critical?**

- Prevent malicious attacks
- Guarantee data integrity
- Comply with enterprise security

## 🏗️ AWS Demo: E-commerce Notification System (2 mins)

### Architecture:

```
Online Store → API Gateway → Lambda → DynamoDB
                    ↓
                SQS DLQ ← SNS Topic ← EventBridge
```

### Components:

1. **API Gateway**: Receives webhooks with rate limiting
2. **Lambda Function**:
   - Verifies signature with AWS Secrets Manager
   - Implements idempotency with DynamoDB
   - Processes event (email, SMS, update inventory)
3. **EventBridge**: Distributes events to multiple services
4. **SQS Dead Letter Queue**: Handles failures after retries
5. **CloudWatch**: Monitoring and alerts

### Use Cases:

- **New order**: Webhook → Send confirmation email + SMS + update inventory
- **Payment failed**: Webhook → Pause order + notify customer + alert admin
- **Product out of stock**: Webhook → Notify suppliers + update website

### Lambda Code (Example):

```python
import json
import boto3
import hmac
import hashlib

def lambda_handler(event, context):
    # 1. Verify signature
    if not verify_signature(event['body'], event['headers']):
        return {'statusCode': 401}

    # 2. Extract webhook_id for idempotency
    webhook_id = json.loads(event['body'])['id']

    # 3. Check if we already processed this event
    if already_processed(webhook_id):
        return {'statusCode': 200, 'body': 'Already processed'}

    # 4. Process event
    try:
        process_webhook_event(json.loads(event['body']))
        mark_as_processed(webhook_id)
        return {'statusCode': 200}
    except Exception as e:
        # Lambda automatically retries on error
        raise e
```

## 🎯 Conclusions and Best Practices (1 min)

### Checklist for Robust Webhooks:

- ✅ **Always implement idempotency** (use unique IDs)
- ✅ **Configure retries with exponential backoff**
- ✅ **Verify signatures on ALL webhooks**
- ✅ **Respond quickly** (< 10 seconds)
- ✅ **Complete logging** for debugging
- ✅ **Dead Letter Queue** for failed events
- ✅ **Proactive monitoring and alerts**

### The Mantra:

> "A well-implemented webhook is invisible when it works, and debuggable when it doesn't"

---

## 🔗 Additional Resources

- AWS EventBridge Documentation
- Stripe Webhooks Best Practices
- RFC 7517 (JSON Web Signatures)

_Questions? Let's discuss your specific use cases!_
