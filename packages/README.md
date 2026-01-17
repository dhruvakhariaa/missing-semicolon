# Shared Packages

This folder contains shared code used across multiple services.

## Packages

### `@sdp/common`
Shared utilities, constants, and types used by all services.

Contents:
- constants/     # Shared constants (error codes, status codes)
- types/         # Shared TypeScript types
- utils/         # Common utility functions (logger, validators)
- errors/        # Custom error classes

### `@sdp/events`
Shared event definitions for RabbitMQ pub/sub.

Contents:
- definitions/   # Event type definitions
- schemas/       # Event payload schemas
- handlers/      # Base event handler classes
