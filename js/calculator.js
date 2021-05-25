"use strict";
var $ = function(id) { return document.getElementById(id); };
const e = Math.E;
const p = Math.PI;
var x = 0;  //  Dynamic variable for x
var y = 0;  //  Dynamic variable for y
var a = 0;  //  Stores last computed answer
var act = "";   //  Actual function for evaluation
var alt_mode = false;

/**
 * Hook onclick events to buttons
 */
window.onload = function() {
    //  Basic evaluation capable characters
    Array.from(document.getElementsByClassName("basic_input")).forEach(element => {
        element.onclick = display_number;
    });
    //  Variables display
    Array.from(document.getElementsByClassName("adv_input")).forEach(element => {
        element.onclick = display_special;
    });
    //  Simple operators
    $("func_add").onclick = math_simple;
    $("func_sub").onclick = math_simple;
    //  Advanced operators
    $("func_mul").onclick = math_comp;
    $("func_div").onclick = math_comp;
    //  Power operators
    $("func_square").onclick = math_power;
    $("func_inverse").onclick = math_power;
    //  Root operators
    $("func_root").onclick = math_root;
    //  Erasing functions
    $("func_del").onclick = display_delete;
    $("func_clr").onclick = display_clear;
    //  Compute function
    $("func_equals").onclick = display_calculate;
    //  Change 2 buttons properties to adjust functionality
    $("func_change").onclick = mode_shift;
    //  Show / hide advanced tab
    $("advanced_mode").onclick = copy_clip;
    //  Set variables
    $("set_x").onclick = change_x;
    $("set_y").onclick = change_y;
};


var change_x = function () {
    x = parseFloat(prompt("Please entere desired value of x."));
};
var change_y = function () {
    y = parseFloat(prompt("Please entere desired value of y."));
};

/** UNUSED !!!
 * Temp placeholder for debugging
 */
var debug = function () {
    // var disp = $("main_display");        //  Display window
    // console.log(disp.value.charAt(disp.value.length-2));
    console.log(act + " : " + a);
};

/** UNUSED !!!
 * For advanced mode. Currently unused
 */
var advanced_mode = function () {
    var x = $("extra_window");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
};

/**
 * Copies whatever is within the display.
 */
var copy_clip = function () {
    $("main_display").select();
    $("main_display").setSelectionRange(0, 999);
    document.execCommand("copy");
    $("main_display").setSelectionRange(0, 0);
};

/**
 * Changes the mode of for 2 buttons : square > cube for root and power as well as its own look.
 */
var mode_shift = function () {
    if (alt_mode){
        alt_mode = false;
        //  Change X and Y buttons
        $("spec_x").style.display = "block";
        $("spec_y").style.display = "block";
        $("set_x").style.display = "none";
        $("set_y").style.display = "none";
        //  Adjust information of Square and root buttons
        $("func_change").innerHTML = "&#8634;";
        $("func_root").innerHTML = "&radic;x"
        $("func_root").value = "i";
        $("func_square").innerHTML = "x&sup2;"
        $("func_square").value = "g";
    }
    else{
        alt_mode = true;
        //  Change X and Y buttons
        $("spec_x").style.display = "none";
        $("spec_y").style.display = "none";
        $("set_x").style.display = "block";
        $("set_y").style.display = "block";
        //  Adjust information of Square and root buttons
        $("func_change").innerHTML = "&#8635;";
        $("func_root").innerHTML = "&#8731;x"
        $("func_root").value = "j";
        $("func_square").innerHTML = "x&sup3;"
        $("func_square").value = "h";
    }
};

/**
 * Executes main loop for evaluation and prints it into display as well as placeholder.
 */
var display_calculate = function () {
    a = evaluate(act);                      //  Runs more complex evaluate() function
    act = ""+a;                             //  Ensures that equations are stored as a string
    $("main_display").value = ""+a;
    $("main_display").placeholder = ""+a;
};

/**
 * Calculate hidden equation for accuracy and string compactness
 */
var evaluate = function (equation) {
    //  Check if roots exist. Check is done with identifying letters i and j for 2 corresponding roots.
    //  console.log("Checking for roots in: " + equation);
    while (equation.indexOf('i') != -1 || equation.indexOf('j') != -1) {    //  Will run if there is I or J present in the equation. I represents Square root J cube root
        //  console.log("Root found in: "+equation);
        var rootPos = Math.max(equation.indexOf('i'), equation.indexOf('j'));   //  Locates the position of the root
        var rootType = equation.charAt(rootPos);                                //  Quick refference for the root
        equation = get_root(rootType, rootPos, equation);                       //  Tries to compile the root
        //  console.log("Root returned as: "+equation);
    }
    //  Check for powers
    //  console.log("Checking for powers in: " + equation);
    while (equation.indexOf('g') != -1 || equation.indexOf('h') != -1 || equation.indexOf('k') != -1) {     //  Will run if there is g, h, k letters in equation powers : g=2, h=3,j=-1
        //  console.log("Power found in: "+equation);
        var powerPos = Math.max(equation.indexOf('g'), equation.indexOf('h'), equation.indexOf('k'));       //  Finds the position of each letter
        var powerType = equation.charAt(powerPos);                                                          //  Grabs the type of power for refference
        equation = get_power(powerType, powerPos, equation);
    }
    //  Check for parentheses imbalance (Mostly used as part of nesting while getting roots or powers)
    if(equation.indexOf('(') != -1){    
        if(equation.indexOf(')') == -1){
            equation += ")";
            console.log("Missing parantheses ! Chaging "+equation.substring(0,equation.length-1)+" ==> "+equation);
        }
    }
    return eval(equation);
};

/**
 * Gets the power of a number contained within the specific equation.
 * This will return a cut up version of the equation with specified power computed
 * @param {Power type: g => square | h => cube | k => inverse} type 
 * @param {Position of the power symbol} index 
 * @param {Equation that has the power in it} equation 
 */
var get_power = function (type, index, equation) {
    //  Check if power comes after parentheses to ensure that content in parentheses is calculated rather than the last number
    var close = 0;
    if (equation.charAt(index-1) == ')') {
        var depth = 0;
        for (var i = index-1; i > -1; i--) {
            if (equation.charAt(i) == ')')
                depth++;
            if (equation.charAt(i) == '(') {
                depth--;
                if (depth < 1) {
                    close = i;
                    i = -1;
                }
            }
        }
    }
    //  If parentheses are not present check until for next arithmetic sign (this will help identify a number as a whole)
    else {
        var tmp;
        for (var i = index; i >-1; i--) {
            tmp = equation.charAt(i);
            if (tmp == '+' || tmp == '-' || tmp == '/' || tmp == '*') {
                close = i+1;
                i=-1;
            }
        }
    }
    var work = equation.substring(close,index);     //  Cut off portion that should contain anything that needs to be raised to higher power
    //  console.log("Getting power of: "+work);
    var power;
    if (type == 'g')
        power = Math.pow(evaluate(work),2);
    else if (type == 'h')
        power = Math.pow(evaluate(work),3);
    else if (type == 'k')
        power = Math.pow(evaluate(work),-1);
    return equation.substring(0,close) + power + equation.substring(index+1,equation.length);
};

/**
 * Gets a square or cube root contained within the specified equation
 * This will return a cut up version of the equation with specified root computed
 * @param {Root type: i => square root | j => cube root} type 
 * @param {Position of the root symbol} index 
 * @param {Equation that has the root in it} equation 
 */
var get_root = function (type, index, equation) {
    //  Establish where parentheses open / close accurately. This is mostly to allow open ended quick roots such as Root(5 .
    var close = equation.length;
    var depth = 0;
    for (var i = index; i < equation.length; i++){
        if (equation.charAt(i) == '(')
            depth++;
        if (equation.charAt(i) == ')') {
            depth--;
            if (depth < 1) {
                close = i+1;
                i = equation.length;
            }
        }
    }
    //  Slice off a portion to work with
    var work = equation.substring(index+1,close);
    console.log("Getting root of: "+work);
    var root;
    if (type == 'i')
        root = Math.sqrt(evaluate(work));
    else if (type == 'j')
        root = Math.cbrt(evaluate(work));
    //  !!! !!! !!! May require revision after testing
    return equation = equation.substring(0,index) + root + equation.substring(close,equation.length);
};

/**
 * Deletes the last character in the display ensuring that both equations match up as close as they should.
 */
var display_delete = function (press) {
    //  Setup variables for ease of access
    var disp = $("main_display");           //  Display window
    var last = act.charAt(act.length-1);    //  Last char in the hidden equation
    //  Check if variable "Ans" is deleted and remove 2 ectra characters used
    if (last == 'a') {  disp.value = disp.value.substring(0,disp.value.length-2);   }
    /** 
     *  This particular part checks for special character multiplication variations. 
     *  eg.:    5e & 5*e    have to behave same as  5xe & 5*e   .
     *  his will check if the hidden equation has a multiplication sign that is not otherwise present in display.
    */  
    if ((last == 'e' || last == 'p' || last == 'x' || last == 'y' || last == 'a' || last == '(' || last == 'i' || last == 'j') && act.charAt(act.length-2) == '*') {
        //  This is a particularly interesting case as this was the only way to achieve comparison
        //  Was not able to compare characters unless refferencing them back to HTML
        if (disp.value.charAt(disp.value.length-2) != $("func_mul").innerHTML)  
            act = act.substring(0,act.length-1);
    }
    //  Remove 1 character away from each of the strings as a final step
    act = act.substring(0,act.length-1);
    disp.value = disp.value.substring(0, disp.value.length-1);
};

/**
 * Clears the display fully. If the display is already clear it also resets textbox placeholder and answer.
 */
var display_clear = function (press) {
    if (act == "") {
        a = 0;
        $("main_display").placeholder = "0";
    }
    act = "";
    $("main_display").value = "";
};

/**
 * Puts displayed property in the textbox and actual value inside hidden equation. This is used as main term for any digit and as last move for complex inputs
 * @param {Information of button that was pressed} press 
 */
var display_number = function (press) {
    act += press.target.value;
    $("main_display").value += press.target.innerHTML;
};

/**
 * Checks if the button does not follow + or - sign. This is to prevent a series of - or + signs used as well as few other occasions that they may be undersirable in
 * @param {Information of button that was pressed} press 
 */
var math_simple = function (press) {
    var last = act.charAt(act.length-1);
    if (last != "+" && last != "-") {
        display_number(press);
    }
    else {
        console.log(press.target.value + " cannot be placed here");
    }
};

/**
 * Checks if the button does not come onto an empty string and does not follow a / or * sign.
 * This is used more widely. But fonction similarly to math_simple() with few tiny differences.
 * @param {Information of button that was pressed} press 
 */
var math_comp = function (press) {
    var last = act.charAt(act.length-1);
    if (act.length > 0 && last != "*" && last != "/") {
        math_simple(press);
    }
    else{
        console.log(press.target.value + " cannot be placed here");
    }
};

/**
 * Checks if there is an operator in front, if not place a * sign in hidden equation.
 * This is to allow neat and easy writing of variables such as 5x or 6Root(9)
 * @param {Information of the button that was pressed} press 
 */
var display_special = function (press) {
    var last = act.charAt(act.length-1);
    if (act.length > 0 && last != "+" && last != "-" && last != "/" && last != "*" && last != "(") {
        act += "*";
    }
    display_number(press);
};

/**
 * This ensure that power symbol gets attached to a variable or a number rather than following another power symbol or open parentheses or the likes
 * @param {Information of the button that was pressed} press 
 */
var math_power = function (press) {
    var last = act.charAt(act.length-1);
    if (act.length > 0 && last != "+" && last != "-" && last != "/" && last != "*" && last != "(" && last != "g" && last != "h" && last != "i" && last != "j" && last != "k") {
        act+=press.target.value;
        $("main_display").value += press.target.innerHTML.substring(1,press.target.innerHTML.length);
    }
    else{
        console.log(press.target.innerHTML + " cannot be placed here");
    }
};

/**
 * Similar to math_power() it checks that root is placed in valid place.
 * @param {Information of the button that was pressed} press 
 */
var math_root = function (press) {
    var last = act.charAt(act.length-1);
    if (act.length > 0 && last != "+" && last != "-" && last != "/" && last != "*" && last != "(" && last != "g" && last != "h" && last != "i" && last != "j" && last != "k") {
        act+="*";
    }
    act+=press.target.value + "(";
    $("main_display").value += press.target.innerHTML.substring(0,press.target.innerHTML.length-1) + "(";
};