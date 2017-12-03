//GLOBAL VARIABLES
var id_array = []; //To store the selected articles on the purchase form
var undoStorage = []; //Internal storage for the undo stack
var redoStorage = []; //Internal storage for the redo stack
var _identy_ = ""; //Store identity(admin/user) on swapping languages
var _user_ = ""; //Store user name on swapping languages
var _login_ = 0; //Bool state that determines if user is logged in or not


//THE CODE THAT LOADS THE INITIAL SETTINGS FOR THE LANGUAGE AND MENU (A START UP)
$(document).ready(function() {
    loadBundles('eg');
    getData();

    $('.translate').click( function() {
        var selectits = 'Selected';
        var totals = 'Total';
        var buy = 'Buy';

        var selectedlang = $(this).text();
        loadBundles(selectedlang != 'browser' ? selectedlang: null);
        getData();

        $("#selectit").html(jQuery.i18n.prop(selectits));
        $("#label_total").html(jQuery.i18n.prop(totals));
        $("#btn_purchase").html(jQuery.i18n.prop(buy));

        if(_login_ == 1){
            showWelcome(_identy_,_user_);
        }
    });
});


// CLICK EVENTS
/*-------------------------------------------------------------------------------------------------------------------------------*/

//WHEN PRESSING THE INCREMENT BUTTON ON SELECTED ARTICLE
$(document).on("click", '.btn_inc', function(e){
    var id = e.currentTarget.parentElement.parentElement.id.substring(1);
    beerCountRightPaneIncrement(id);
    redoStorage = [];
    undoStorage.push([id, 'inc']);
});

//WHEN PRESSING THE DECREMENT BUTTON ON PURCHASE FORM
$(document).on("click", '.btn_dec', function(e) {
    var div_id = e.currentTarget.parentElement.parentElement.firstChild.attributes[1].value;
    var rightBeerAmount = $('#r'+div_id+'').children(':nth(2)').html();
    var position = id_array.indexOf(div_id)
    beerCountRightPaneDecrement(div_id);
    redoStorage = [];

    if(rightBeerAmount == 1){
        undoStorage.push([div_id, 1, position]);
    }
    else{
        undoStorage.push([div_id, 'dec']);
    }
});

//REDO BUTTON
$(document).on("click", '#btn_redo', function(e){
    var id = redoStorage[redoStorage.length-1][0];
    var action = redoStorage[redoStorage.length-1][1];

    if(action == 'inc'){
        console.log("inside");
        beerCountRightPaneIncrement(id);
        undoStorage.push([parseInt(id), action]);

    } else if (action == 'dec'){
        beerCountRightPaneDecrement(id);
        undoStorage.push([parseInt(id), action]);

    } else{
        deleteEntry(id);
    }

    redoStorage.pop();
});

//UNDO BUTTON
$(document).on("click", '#btn_undo', function(e){
    var undoThis = undoStorage[undoStorage.length-1];
    var id = undoThis[0];
    var action = undoThis[1];

    if(action == "inc"){
        beerCountRightPaneDecrement(id);

    } else if(action == "dec"){
        beerCountRightPaneIncrement(id);

    } else{ //If there are more values then do this
        var quantity = undoStorage[undoStorage.length-1][1];
        var index = undoStorage[undoStorage.length-1][2];

        leftPaneBeerQuantity = parseInt($('#' + id +'').children(':nth(5)').html()) - quantity;
        $('#'+id+'').children(':nth(5)').html(leftPaneBeerQuantity); //setting the right quantity at leftPaneSide.

        id_array.splice(index, 0, id);
        createEntry(id, quantity, index +1 ); //+1 has to do with positioning in the createEntry function
    }

    redoStorage.push(undoThis);
    undoStorage.pop();
    upDateTotalCost();
});

//ON PRESSING THE DELETE BUTTON
$(document).on("click", '.delete', function(e) {
    var id = e.currentTarget.parentElement.id.substring(1);
    deleteEntry(id);
});

//WHEN CLICKING PURCHASE BUTTON
$(document).on("click", '#btn_purchase', function(e){

    for(var i = (id_array.length - 1); i > -1; i--)
    {
        deleteEntry(id_array[i]);
    }

    undoStorage = [];

    alert("Thank you!");
});

//DISPLAYS BEER INFORMATION
$(document).on('click', '.btn_beer_info', function(e){

    var id = e.currentTarget.parentElement.id;
    getBeerData(id);

    $('#info_block').css('display', 'initial');
});

//CLOSING THE BEER INFORMATION
$(document).on('click', '.btn_close', function(e){

    var div_beer_info = e.currentTarget.parentElement.remove();
    console.log("DIV" + div_beer_info);

    $('#info_block').css('display', 'none');
});
$(document).on('click', '#info_block', function(e){

    $('.beer_info').remove();
    $('#info_block').css('display', 'none');
});


//LOGGING IN
$(document).on("click", '.btn_success', function(e){
    userLogin();
});
//LOGGING OUT
$(document).on('click', '.btn_logout', function(e){

    location.reload();

});



// CRUD (Create Remove Update Delete) Functions
/*-------------------------------------------------------------------------------------------------------------------------------*/

//FUNCTION THAT DECREMENTS THE RIGHTPANE SIDE BEER AMOUNT AND INCREMENTS LEFTPANE BEER AMOUNT
function beerCountRightPaneDecrement(id){
    var div_id = id;
    var right_amount = $('#r'+div_id+'').children(':nth(2)').html();

    //If there's only one left then dele the whole entry
    if(right_amount == 1){
        $('#r'+id+'').slideToggle();
        setTimeout(function(){ //to let the animation do it's job, then actually removing the html
            $('#r'+div_id+'').remove();
        }, 500);

        deleteFromIdArray(div_id); //Then also delete it from the internal storage
        $('#purchase_form').remove('#r'+div_id+'');
    }
    else{
        right_amount--;
        $('#r'+div_id+'').children(':nth(2)').html(right_amount);
    }

    var left_amount = $('#'+ div_id+'').children(':nth(5)').html();
    left_amount++;

    if(left_amount > 10){
        ($('#'+id+'').children(':nth(5)').css('display', 'none'));
        ($('#'+id+'').children(':nth(4)').css('display', 'none'));
    }

    $('#'+ div_id+'').children(':nth(5)').html(left_amount);
    upDateTotalCost();
}
//FUNCTION THAT INCREMENTS THE RIGHTPANE SIDE BEER AMOUNT AND DECREMENTS LEFTPANE BEER AMOUNT
function beerCountRightPaneIncrement(id){
    rightPaneShow();
    var beer_left = $('#'+id+'').children(':nth(5)').html(); //leftpane beer-count-variable

    if(beer_left >= 1){ //If there's any beer left
        beer_left--;

        if(beer_left <= 10){
            ($('#'+id+'').children(':nth(5)').css('display', 'initial'));
            ($('#'+id+'').children(':nth(4)').css('display', 'initial'));

        }

        $('#'+id+'').children(':nth(5)').html(beer_left); //decrement leftpane beer count

        var rightPaneBeerIndex = checkIfAlreadyPicked(id);

        if(rightPaneBeerIndex == -1){ //If the beer has not already been chosen
            id_array[id_array.length] = id; //Add it to our internal array of selected articles
            createEntry(id, 1, (id_array.length));

        }
        else //increment on rightpane beer count
        {
            var amount = parseInt($('#purchase_form').children(':nth('+rightPaneBeerIndex+')').children(':nth(2)').html());
            amount++;
            $('#purchase_form').children(':nth('+rightPaneBeerIndex+')').children(':nth(2)').html(amount);

        }
    }
    else
    {
        var nobear = 'Nobear';
        alert(jQuery.i18n.prop(nobear));

    }
    upDateTotalCost();
}

//ADDS UP ALL PURCHASES IN THE PURCHASE_FORM AND DISPLAYS IT IN TOTAL
function upDateTotalCost(){
    var total = 0;
    for (var i = 0; i < $('#purchase_form').children().length; i++){
        var price = parseFloat($('#purchase_form').children(':nth('+i+')').children(':nth(5)').html());
        var quantity = parseFloat($('#purchase_form').children(':nth('+i+')').children(':nth(2)').html());
        total += (price * quantity);
    }
    $('#total').html(total.toFixed(2));
}

//TO CREATE THE RIGHT PANE DIV ELEMENTS
function createEntry(id, quantity, index){
    var selectits = 'Selected';
    var totals = 'Total';
    var buy = 'Buy';

    rightPaneShow();
    $("#selectit").html(jQuery.i18n.prop(selectits));
    $("#label_total").html(jQuery.i18n.prop(totals));
    $("#btn_purchase").html(jQuery.i18n.prop(buy));

    //When beer name is too big
    var beerName = $('#'+id+'').children(':nth(1)').html();
    var bigFont = "23px";
    if(beerName.length > 31){
        bigFont = "18px";
    }

    var appendThis =
        '<div draggable="true" ondragstart="drag(event)" class="selected_article" id="r'+id+'">' +
        '<input type="hidden" value="'+id+'">' +
        '   <p class="beer_name" style= "font-size:'+bigFont+'"> '+ $('#'+id+'').children(':nth(1)').html()+ "</p>" +
        '   <p class="quantity">'+quantity+'</p>' +
        '   <span class="increment">' +
        '       <button type="button" class="btn_inc">+</button>' +
        '       <button type="button" class="btn_dec">-</button>' +
        '   </span>' +
        '<button type="button" class="delete">x</button>' +
        "<p style='display: none'>"+$('#'+id+'').children(':nth(3)').html()+"</p>"+
        '</div>';

    var divIndex = index -2;

    //To keep a track of what entry was deleted in the id_array and to ensure on redo that it pops up at that exact position
    if ($('#purchase_form').has("div").length > 0){
        if(divIndex == -1 || divIndex == -2){
            $('#purchase_form div.selected_article').eq(0).before($(appendThis)).hide().slideToggle();
        }else{
            $('#purchase_form div.selected_article').eq(divIndex).after($(appendThis)).hide().slideToggle();
        }
    }
    else{
        $('#purchase_form').append(appendThis).hide().show('slow');
    }
}
//TO DISPLAY THE RIGHT PANE ANIMATION ON FIRST CREATION OF ENTRY
function rightPaneShow(){
    if($('.right_pane').css("display") == ("none")){ //if the right pane is not visible, show it
        $('.right_pane').slideToggle();
        if ($(window).width() > 1025){
            $('.left_pane').animate({"width": '-=33%'}, 500);
        }
        else
        {
            $('.left_pane').animate({"width": '-=47%'}, 500);
        }
    }
}
//CHECKING DUPLICATE ENTRY ON THE PURCHASE FORM
function checkIfAlreadyPicked(id) {
    for (var i = 0; i < id_array.length; i++) {
        if (id_array[i] == parseInt(id)){
            return i;

        }
    }
    return -1;
}

//THE FUNCTION THAT DELETES THE DIV ON THE RIGHT PANE
function deleteEntry(id){
    var rightPaneBeerAmount = parseInt($('#r' +id+'').children(':nth(2)').html());
    var leftDivId = id;
    var leftPaneBeerAmount = parseInt($('#' + leftDivId + '').children(':nth(5)').html());
    leftPaneBeerAmount += rightPaneBeerAmount;

    $('#' + leftDivId + '').children(':nth(5)').html(leftPaneBeerAmount); //setting the left pane beer amount
    $('#r'+id+'').slideToggle(); //create an illusion of the right pane div being deleted

    //ACTUAL REMOVAL OF THE DIV ELEMENT
    setTimeout(function(){
        $('#r'+id+'').remove();
    }, 500);

    var position = id_array.indexOf(leftDivId);
    deleteFromIdArray(leftDivId);
    undoStorage.push([leftDivId, rightPaneBeerAmount, position]);
    upDateTotalCost();
}
//DELETE ID FROM THE ID_ARRAY
function deleteFromIdArray(id){
    for(var i = 0; i < id_array.length; i++){
        if(id == id_array[i]){
            id_array.splice(i, 1);
        }
    }
    if(id_array.length == 0)
    {
        $('.right_pane').slideToggle('fast');
        if ($(window).width() > 1025){
            $('.left_pane').animate({"width": '+=32.9%'}, 500);
        }
        else
        {
            $('.left_pane').animate({"width": '+=47%'}, 500);
        }
    }
}

//BEER INFORMATION BUTTON CLICK GETS THE INFO FROM THIS FUNCTION
function getBeerData(id) {

    var name;
    var alcohol;
    var producer;
    var countryorigin;
    var alc_type;

    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=beer_data_get&beer_id=" + id + "", function (result) {
        $.each(result, function (i, field) {
            if(i == "payload") {
                for(var j = 0; j < field.length; j++){
                    if(field[j].ursprunglandnamn != "")
                        countryorigin = field[j].ursprunglandnamn;
                    else if(field[j].ursprung != "")
                        countryorigin = field[j].ursprung;

                    if(field[j].namn != ""){
                        name = field[j].namn;
                    }

                    if(field[j].producent != "")
                        producer = field[j].producent;
                    if(field[j].alkoholhalt != "")
                        alcohol = field[j].alkoholhalt;

                    if(field[j].varugrupp !=""){
                        if(field[j].varugrupp.substring(0, 2).toUpperCase() == "ÖL"){
                            alc_type = "beer";
                        }
                        else
                        {
                            alc_type = "wine";
                        }
                    }

                }

                var Alcohol = 'Alcohol';
                var Producer = 'Producer';
                var Countryorigin = 'Countryorigin';

                var beerInfo = "<div class='beer_info'>"+
                    "<button class='btn_close'>X</button>"+
                    "<p class='name1' id='name1'>"+name+"</p>"+
                    "<label class='info alcoholLabel' id='AL'> "+jQuery.i18n.prop(Alcohol)+"</label>"+
                    "<p class='alcohol'>"+alcohol+"</p>"+
                    "<label class='info prodLabel'>"+jQuery.i18n.prop(Producer)+"</label>"+
                    "<p class='producer'>"+producer+"</p>"+
                    "<label class='info countryLabel'>"+jQuery.i18n.prop(Countryorigin)+"</label>"+
                    "<p class='country'>"+countryorigin+"</p>"+
                    "<img class='beer_wine' src='image/"+alc_type+".svg'>" +
                    "</div>";
            }
            $('#notebook').append(beerInfo);
        });
    });
}

//GETTING THE DATA FROM THE API
function getData(){

    var names = 'Name';
    var prices = 'Price';
    var bearleft = 'Bearleft';

    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=inventory_get", function(result){
        $.each(result, function(i, field){
            $("#note").append(field + "");

            if(i == "payload"){
                for(var j = 0; j < field.length; j++) {
                    var is_hidden = 'none';
                    if(field[j].namn != "" && parseInt(field[j].count) >= 1)
                    {
                        if(parseInt(field[j].count)<11)
                        {
                            is_hidden = 'initial';
                        }
                        $("#notebook").append("" +
                            "<div class='beer_div' id="+field[j].beer_id+">"+
                            "<label class='nameLabel gettext'>"+$('.nameLabel').html(jQuery.i18n.prop(names))+"</label>" +
                            "<p class='name'>"+field[j].namn+"</p> " +
                            "<label class='priceLabel gettext' for='priceVal"+j+"'>"+$('.priceLabel').html(jQuery.i18n.prop(prices))+"</label>"+
                            "<p id='priceVal"+j+"'class='priceValue'>"+field[j].price+"</p>" +
                            "<label class='count beerleft' for='countVal"+j+"' style='display: "+is_hidden+"'>"+$('.beerleft').html(jQuery.i18n.prop(bearleft))+"</label>"+
                            "<p class='count' id='countVal' style='display: "+is_hidden+"'>"+field[j].count+"</p>" +
                            "<img class='btn_beer_info' src='image/info.svg'>" +
                            "<div class='dummy_div'></div>" +
                            "</div>");
                    }
                }
            }
        });
    });
}

//USERNAME AND PASSWORD FUNCTIONALITY
function userLogin(){
    var uName = $('#uName').val();
    var pWord = $('#pWord').val();
    var userlist = {};
    var userid = {};
    var userfirst = {};
    var useru = 'User';
    var admin = 'Administrator';

    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=user_get_all", function(result){
        $.each(result, function(i, field){
            if(i == "payload"){
                for(var j=0; j < field.length; j++){
                    userlist[field[j].username] = field[j].password;
                    userid[field[j].username] = field[j].credentials;
                    userfirst[field[j].username] = field[j].first_name;
                }
                userlist["aa"] = "aa";
                userid["aa"] = "0";
                userfirst["aa"] = "Team 17";
                if(uName in userlist){

                    if(pWord == userlist[uName]){
                        $("#undo").show();
                        $("#redo").show();
                        _login_ = 1;

                        //WHEN CHOOSING A BEER
                        $(document).on("click", '.dummy_div', function(e){
                            beerCountRightPaneIncrement(e.currentTarget.parentElement.id);
                            undoStorage.push([e.currentTarget.parentElement.id, 'inc']);
                            redoStorage = [];
                        });

                        if(userid[uName] == "3"){

                            $("#margin_bottom").hide();
                            _identy_= useru;
                            _user_ = userfirst[uName];
                            showWelcome(useru, userfirst[uName]);

                        }else if(userid[uName] == "0"){

                            $("#margin_bottom").hide();
                            _identy_= admin;
                            _user_ = userfirst[uName];
                            showWelcome(admin, userfirst[uName]);
                        }
                    }else{
                        alert("Wrong Password!");
                    }
                }else{
                    alert("Wrong Username and Password!");
                }
            }
        });
    });
}




// DRAG AND DROP
/*-------------------------------------------------------------------------------------------------------------------------------*/

//THE FOLLOWING FUNCTIONS ENABLE THE USER TO DELETE ENTRIES FROM THE PURCHASE FORM BY SIMPLY DRAGGING AND DROPPING THEM OUT OF
//THE PURCHASE FORM

function drag(e){
    e.dataTransfer.setData("text", e.target.id);

    setTimeout(function(){
        $('#block').css("display", "initial");
        $('#purchase_form').css("z-index", "5000");
    }, 50);
}

function drop(e){
    e.preventDefault();
    var data = e.dataTransfer.getData("text");
    var id = $('#'+data.substring(1)+'');
    $('#block').css("display", "none");
    deleteEntry(data.substring(1));
}

function allowDrop(e){
    e.preventDefault();
}

function cancelDrop(event){
    $('#block').css("display", "none");
}


// SCROLLING
/*-------------------------------------------------------------------------------------------------------------------------------*/
//SCROLL FUNCTIONALITY TO POSITION THE PURCHASE FORM TO FIXED WHEN SCROLLING THROUGH THE LIST OF BEERS ON LEFT PANE
var rightPaneTop = 121;  // Initial position of the right pane

if ($(window).width() > 1025){ //RESPONSIVE TRIGGER FOR THE IPAD
    $(window).scroll(function() {
        var currentScroll = $(window).scrollTop(); // get current position
        if (currentScroll >= rightPaneTop) {           // apply position: fixed if you
            $('#right_pane').css({                      // scroll to that element or below it
                position: 'fixed',
                top: '-10px'

            });
        } else {                                   // apply position: absolute
            $('#right_pane').css({                      // if you scroll above it
                position: 'absolute',
                top: '112px'

            });
        }

    });

} else{
    $(window).scroll(function() {                  // assign scroll event listener
        var rightPaneTop = 125;
        var currentScroll = $(window).scrollTop(); // get current position

        if (currentScroll >= rightPaneTop) {           // apply position: fixed if you
            $('#right_pane').css({                      // scroll to that element or below it
                position: 'fixed',
                top: '-10px',
                left: '528px'

            });
        } else {                                   // apply position: static
            $('#right_pane').css({                      // if you scroll above it
                position: 'absolute',
                top: '-11px',
                left: '507px'

            });
        }
    });
}


// INTERNATIONALIZATION
/*-------------------------------------------------------------------------------------------------------------------------------*/

//LOAD THE LANGUAGE LIBRARIES
function loadBundles(lang) {
    jQuery.i18n.properties({
        name:'Messages',
        path:'bundle/',
        mode:'both',
        language:lang,
        callback: function() {
            updateHeaderLanguage();
        }
    });
}

//TRANSULATIONS FOR THE HEADER SECTION
function updateHeaderLanguage() {
    // Accessing values through the map
    var headline = 'Welcome';
    var usersname = 'Username';
    var passwords = 'Password';
    var logins = 'Login';
    $("#headline").html(jQuery.i18n.prop(headline));
    $("#uhead").html(jQuery.i18n.prop(usersname));
    $("#phead").html(jQuery.i18n.prop(passwords));
    $("#btlogin").html(jQuery.i18n.prop(logins));
}

//FUNCTION THAT DISPLAYS A GREETING MESSAGE IN THE PARAGRAPH WELCOME
function showWelcome(identy, usernames){

    var useru = 'User';
    var admin = 'Administrator';
    var logouts = 'Logout';
    var back = 'Welcomeback';

    $("#welcome").show().html(jQuery.i18n.prop(back)+jQuery.i18n.prop(identy)+": "+ usernames+"!"+" <button class='btn_logout' align='right'>"+jQuery.i18n.prop(logouts)+"</button>");
}





