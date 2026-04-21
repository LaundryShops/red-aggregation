---
name: red-aggregate
description: >-
  Extends and tests the red-aggregate TypeScript library that builds MongoDB
  aggregation expressions via AggregationExpression.toDocument. Use when adding
  or fixing aggregation operators ($add, $filter, etc.), factories under
  src/operator, Field/Fields usage, AggregationOperationContext, or Jest specs
  that assert BSON output with NoOpAggregationOperationContext.
---

# red-aggregate (mongodb-aggregation)

## Goal

Ship operators and facades that serialize to the same BSON shape MongoDB expects in aggregation pipelines.

## Before coding

1. Find the closest existing operator in the same category under `src/operator/<category>/`.
2. Check whether the category exposes a `*Factory` or `*Operators` helper; mirror registration when adding a new surface.

## Implementing an operator

1. Subclass `AbstractOperatorExpression` unless the operator shape cannot use its `toDocument` wrapper (then subclass `AggregationExpression` directly and own the returned `Document`).
2. Implement `getMongoMethod()` as the exact operator string, e.g. `$add`, `$filter`.
3. Accept inputs using the same patterns as siblings: `Fields.field` / `Fields.fields`, nested `AggregationExpression`, literals where Mongo allows.
4. Validate with `Assert` from `src/utils` instead of silent failure.

## Context and serialization

- `toDocument` always receives an `AggregationOperationContext`. Tests use `NoOpAggregationOperationContext` for straightforward field refs (`$field`).
- For `expose` / nested pipelines, use the same context types as existing aggregate operations in `src/aggregate/`.

## Tests

1. Add or extend `src/tests/operator/.../*.spec.ts`.
2. Assert `expression.toDocument(new NoOpAggregationOperationContext())` equals the expected plain object (BSON-ready).
3. Cover at least one happy path and invalid input if the public API throws (match message style of nearby specs).

## Verification

Run `npm test` from the repo root after changes.
