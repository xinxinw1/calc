# Complex Number Calculator

This is an arbitrary precision online calculator.

Run it at http://musiclifephilosophy.com/codes/calc/

## Examples

Calculate pi to 1000 decimals

`piFn(1000)`

Pythagorean theorem

`x=3, y=4, sqrt(x^2+y^2)`

Euler's formula

`x=1, exp(i*x)`  
`x=1, cos(x)+i*sin(x)`

Factorial of 1000

`1000!`

Divide 1 by 127 to 1000 decimal places

`div(1, 127, 1000)`

Strange complex number formula that always results in a real number

`x=2, y=3, sqrt(x+y*i)+sqrt(x-y*i)`

Define a function

`f(x) = x^3 + 2*x^2 + 5`  
`f(2.5)`  
`f(1+i)`

Square root of -1

`sqrt(-1)`

Square root of 2 to 1000 decimals

`sqrt(2, 1000)`

Amazing identity (the 20 is just for precision)

`x=2, y=5, cbrt(x+sqrt(y, 20))+cbrt(x-sqrt(y, 20))`

[Frank Nelson Cole's famous number](http://en.wikipedia.org/wiki/Frank_Nelson_Cole)

`193707721 * 761838257287`  
`2^67 - 1`

## How to use

Simply type the expression you want to calculate into the bar at the bottom and press enter. An example is already inputed for you.

You can go to a past expression by pressing the up and down keys on your keyboard.

The mathematical operators `+` (add), `-` (subtract), `*` (multiply), `/` (divide), `^` (power), and `!` (factorial) are supported. You can also use brackets `(` and `)` and the calculator has complete support for order of operations. (You can use the function versions of these operators to get precise control over rounding.)

Functions can be called by typing the name of the function, an open bracket `(`, the arguments separated by commas `,` and a close bracket `)`. (ex. `sin(50)` and `round(2.5382953, 3)` ) The supported functions are listed below.

Take note that after the main arguments of almost every function, there is an argument for "precision" or number of decimal places to calculate/round to. This means that `add(3.5334, 4.334, 2)` doesn't result in `9.8674`, but `7.87` instead, because the final `2` is the number of decimals to round the result to.

Variables can be set by entering the variable name followed by an equal sign `=` and then the value you want to set it to. You can use multiple equal signs and it will set the right-most variable first. You can then refer to the variable in your expression as if it were a number. (ex. `x = 5*sin(3)/2`)

Functions can be created by entering something like `f(x) = x^3 + 2*x^2 + 5` and then calling `f(2.4)`.

You can set a variable and use it in one line with the comma (or progn) operator. Expressions separated with commas are evaluated from left to right. (ex. `x=3, y=4, sqrt(x^2+y^2)` )

You can unset a variable with the unset function. (ex. after running `x = 3` and then `unset(x)`, running `x` should result in an error.) You can unset a function by calling unset with the function name (ex. `f(x) = x^2`, then run `unset(f)`)

## Troubleshooting

### Why are the results sometimes inaccurate?

If you run `e^(i*pi)` for example, the given answer is `-1+0.0000000000000001i` instead of the expected `-1` because both `e` and `pi` are rounded to 16 decimal places before the calculation.

For more accurate results, specify the number of decimal places explicitly like `e(20)^(i*pi(20))` or by using the `exp(x)` function instead of `e` like `exp(i*pi)` which tends to be more accurate.

### Why don't you have inverse trig functions?

Eventually I will. So far, I haven't got the time to implement an algorithm or formula for them yet and also to mathematically guarantee their accuracy.

In the meantime, you can use `atan2(y, x)` and use the formulas found on [Wikipedia](http://en.wikipedia.org/wiki/Inverse_trigonometric_functions#Logarithmic_forms) with the variable system to calculate those functions. You'll probably have to fiddle with the precision arguments to ensure accuracy though.

This is an open source project so you can also implement those functions yourself. Send me a pull request so I can add your additions and everyone else can use them as well.

## How to download

1. `git clone https://github.com/xinxinw1/calc.git`
2. `cd calc`
3. `git submodule update --init`
3. Open `index.html` in your browser.

## How to run tests

Download and then open `tests.html` in your browser.

Or, go to http://musiclifephilosophy.com/codes/calc/tests.html

## Predefined variables

```
Note: 16 decimal places by default, you can calculate to more decimals by
      using the function versions listed in the function reference below
pi               the circle constant 3.1415926535897932...
e                Euler's number 2.7182818284590452...
phi              the golden ratio 1.6180339887498948...
```

## Function reference

```
Note: This reference is basically the same as the reference for
      https://github.com/xinxinw1/cmpl-math

#### Basic operation functions

add(z, w, p)      add two complex numbers; if p is given, round to p
                    decimals
sub(z, w, p)      subtract
mul(z, w, p)      multiply
div(z, w, p)      divide

#### Rounding functions

round(z, p)       round both real and imaginary parts of z to p decimals
ceil(z, p)        ceiling
floor(z, p)       floor
trunc(z, p)       truncate

rnd(z, p)         aliases of the functions above
cei(z, p)
flr(z, p)
trn(z, p)

#### Other operation functions

abs(z, p)         absolute value of z
arg(z, p)         principal argument of z; angle in the complex plane
sgn(z, p)         complex signum (defined as z/abs(z), z != 0; 0, z == 0)
re(z)             real part of z
im(z)             imaginary part of z
conj(z)           conjugate of z

#### Extended operation functions

exp(z, p)         exponential function
ln(z, p)          principal natural log (defined as ln(abs(z))+arg(z)*i)
pow(z, w, p)      principal z^w (defined as exp(w*ln(z)))
root(n, z, p)     nth root of z; if z is real and n is real and odd, return real root
sqrt(z, p)        square root of z
cbrt(z, p)        cube root of z
agm(z, w, p)      arithmetic geometric mean

sin(z, p)         complex sine of z
cos(z, p)         complex cosine
sinh(z, p)        hyperbolic sine
cosh(z, p)        hyperbolic cosine

atan2(y, x, p)    two argument arctan

#### Other functions

fact(x)           factorial of x; currently x must be an integer like "34";
                    returns answer in complex number form
bin(x, y)         binomial coefficient

#### Mathematical constants

piFn(p)             the circle constant to p decimal places
eFn(p)              Euler's number
phiFn(p)            the golden ratio

```


