import { ExpressionVariable, Let, LetBuilder } from "./let";

export class VariableOperators {
    static define(variables: ExpressionVariable[]): LetBuilder;
    static define(...variables: ExpressionVariable[]): LetBuilder;
    static define(variable: ExpressionVariable | ExpressionVariable[], ...variables: ExpressionVariable[]) {
        if (!Array.isArray(variable)) {
            return VariableOperators.define([variable, ...variables])
        }

        return Let.define(variable);
    }
}