import { Add } from "./add";
import { Abs } from "./abs";
import { Ceil } from "./ceil";
import { Divide } from "./divide";
import { Multiply } from "./multiply";
import { Exp } from "./exp";
import { Floor } from "./floor";
import { Ln } from "./ln";
import { Log } from "./log";
import { Log10 } from "./log10";
import { Mod } from "./mod";
import { Trunc } from "./trunc";
import { Subtract } from "./subtract";
import { Sqrt } from "./sqrt";
import { Round } from "./round";
import { Pow } from "./pow";

export class ArithmeticOperators {
    static abs(fieldReference: string): Abs
    static abs(number: number): Abs;
    static abs(expression: Record<string, any>): Abs
    static abs(value: any) {
        return Abs.valueOf(value);
    }

    static add(fieldReference: string): Add
    static add(number: number): Add
    static add(expression: Record<string, any>): Add
    static add(value: any) {
        return Add.valueOf(value)
    }

    static ceil(fieldReference: string): Ceil;
    static ceil(number: number): Ceil;
    static ceil(expression: Record<string, any>): Ceil;
    static ceil(value: any) {
        return Ceil.valueOf(value);
    }

    static divide(fieldReference: string): Divide;
    static divide(number: number): Divide;
    static divide(expression: Record<string, any>): Divide;
    static divide(value: any) {
        return Divide.valueOf(value);
    }

    static exp(fieldReference: string): Exp;
    static exp(number: number): Exp;
    static exp(expression: Record<string, any>): Exp;
    static exp(value: any) {
        return Exp.valueOf(value);
    }

    static floor(fieldReference: string): Floor;
    static floor(number: number): Floor;
    static floor(expression: Record<string, any>): Floor;
    static floor(value: any) {
        return Floor.valueOf(value);
    }

    static ln(fieldReference: string): Ln;
    static ln(number: number): Ln;
    static ln(expression: Record<string, any>): Ln;
    static ln(value: any) {
        return Ln.valueOf(value);
    }

    static log(fieldReference: string): Log;
    static log(number: number): Log;
    static log(expression: Record<string, any>): Log;
    static log(value: any) { 
        return Log.valueOf(value);
    }

    static log10(fieldReference: string): Log10;
    static log10(number: number): Log10;
    static log10(expression: Record<string, any>): Log10;
    static log10(number: any) {
        return Log10.valueOf(number)
    }

    static mod(fieldReference: string): Mod;
    static mod(number: number): Mod;
    static mod(expression: Record<string, any>): Mod;
    static mod(number: any) {
        return Mod.valueOf(number);
    }

    static multiply(number: number): Multiply;
    static multiply(fieldReference: string): Multiply;
    static multiply(expression: Record<string, any>): Multiply;
    static multiply(value: any) {
        return Multiply.valueOf(value);
    }

    static pow(fieldReference: string): Pow;
    static pow(number: number): Pow;
    static pow(expression: Record<string, any>): Pow;
    static pow(number: any) {
        return Pow.valueOf(number)
    }

    static round(fieldReference: string): Round;
    static round(number: number): Round;
    static round(expression: Record<string, any>): Round;
    static round(number: any) {
        return Round.valueOf(number)
    }
    
    static sqrt(fieldReference: string): Sqrt;
    static sqrt(number: number): Sqrt;
    static sqrt(expression: Record<string, any>): Sqrt;
    static sqrt(number: any) {
        return Sqrt.valueOf(number);
    }
    
    static subtract(fieldReference: string): Subtract;
    static subtract(number: number): Subtract;
    static subtract(expression: Record<string, any>): Subtract;
    static subtract(number: any) {
        return Subtract.valueOf(number);
    }
    
    static trunc(fieldReference: string): Trunc;
    static trunc(number: number): Trunc;
    static trunc(expression: Record<string, any>): Trunc;
    static trunc(number: any) {
        return Trunc.valueOf(number);
    }
}
