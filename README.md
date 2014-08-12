# Complex Number Calculator

This is an arbitrary precision online calculator.

Run it at http://xinxinw1.github.io/calc/

## Examples

Calculate pi to 1000 decimals

`pi(1000)`

Pythagorean theorem

`x=3, y=4, sqrt(x^2+y^2)`

Euler's formula

`x=1, exp(i*x)`  
`x=1, cos(x)+i*sin(x)`

Strange complex number formula that always results in a real number

`x=2, y=3, sqrt(x+y*i)+sqrt(x-y*i)`

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

Take note that after the main arguments of almost every functions, there is an argument for "precision" or number of decimal places to calculate/round to. This means that `add(3.5334, 4.334, 2)` doesn't result in `9.8674`, but `7.87` instead, because the final `2` is the number of decimals to round the result to.

Variables can be set by entering the variable name followed by an equal sign `=` and then the value you want to set it to. You can use multiple equal signs and it will set the right-most variable first. You can then refer to the variable in your expression as if it were a number. (ex. `x = 5*sin(3)/2`)

You can set a variable and use it in one line with the comma (or progn) operator. Expressions separated with commas are evaluated from left to right. (ex. `x=3, y=4, sqrt(x^2+y^2)` )

You can unset a variable with the unset function. (ex. after running `x = 3` and then `unset(x)`, running `x` should result in an error.)

## Troubleshooting

### Why are the results sometimes inaccurate?

If you run `e^(i*pi)` for example, the given answer is `-1+0.0000000000000001i` instead of the expected `-1` because both `e` and `pi` are rounded to 16 decimal places before the calculation.

For more accurate results, specify the number of decimal places explicitly like `e(20)^(i*pi(20))` or by using the `exp(x)` function instead of `e` like `exp(i*pi)` which tends to be more accurate.

### Why don't you have inverse trig functions?

Eventually I will. So far, I haven't got the time to implement an algorithm or formula for them yet and also to mathematically guarantee their accuracy.

In the meantime, you can use the `arg(x+yi)` function to access `atan2(y, x)` and use the formulas found on [Wikipedia](http://en.wikipedia.org/wiki/Inverse_trigonometric_functions#Logarithmic_forms) with the variable system to calculate those functions. You'll probably have to fiddle with the precision arguments to ensure accuracy though.

This is an open source project so you can also implement those functions yourself. Do send me a pull request so I can add your additions so everyone else can use them as well.

## How to download

1. Go to https://github.com/xinxinw1/calc/releases and download the latest release.
2. Extract the calc directory
3. Open `index.html` in your browser.

## Predefined variables

```
pi               the circle constant 3.14159... (16 decimal places by default
e                Euler's number 2.71828...  You can calculate to more decimals
phi              the golden ratio 1.61803...  by using the function versions
ln2              the natural log of 2  0.693147...  listed in the function
ln5              the natural log of 5  1.6094379...   reference)
ln10             the natural log of 10  2.302585...
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

rnd(z, p)         round both real and imaginary parts of z to p decimals
cei(z, p)         ceiling
flr(z, p)         floor
trn(z, p)         truncate

round(z, p)       aliases of the functions above
ceil(z, p)
floor(z, p)
trunc(z, p)

#### Extended operation functions

exp(z, p)         exponential function
ln(z, p)          principal natural log (defined as ln(abs(z))+arg(z)*i)
pow(z, w, p)      principal z^w (defined as exp(w*ln(z)))
root(n, z, p)     nth root of z; if z is real and n is odd, return real root;
                    n must be a real number like "5"
sqrt(z, p)        square root of z
cbrt(z, p)        cube root of z

fact(x, p)        factorial of x; currently x must be an integer like "34";
                    returns answer in complex number form
bin(x, y, p)      binomial coefficient
agm(x, y, p)      arithmetic geometric mean; x and y must be real

sin(z, p)         complex sine of z
cos(z, p)         complex cosine
sinh(z, p)        hyperbolic sine
cosh(z, p)        hyperbolic cosine

#### Other operation functions

abs(z, p)         absolute value of z
arg(z, p)         principal argument of z; angle in the complex plane
sgn(z, p)         complex signum (defined as z/abs(z), z != 0; 0, z == 0)
re(z)             real part of z
im(z)             imaginary part of z
conj(z)           conjugate of z

#### Mathematical constants

pi(p)             the circle constant to p decimal places
e(p)              Euler's number
phi(p)            the golden ratio
ln2(p)            ln(2)
ln5(p)            ln(5)
ln10(p)           ln(10)

```


