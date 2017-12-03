/* Copyright Bryan W Berry, 2009, 
 * under the MIT license http://www.opensource.org/licenses/mit-license.php
 * 
 * this library is heavily influenced by the GNU LIBC library
 *  http://www.gnu.org/software/libc/manual/html_node/Locales.html
 */

( function ($) {
     // follow 'locale' to change string to another string  
     $.i18n = function (string, locale) {

	 var lang = locale || $.i18n.lang;
	 if (!this.i18n[lang] || !this.i18n[lang].strings) {
	     return string;
	 }
	 return this.i18n[lang].strings[string] || string;
     };

     $._ = $.i18n;

     $.i18n.setLocale = function (locale) {
       $.i18n.lang = locale;
     };

     $.i18n.getLocale = function () {
	 return $.i18n.lang;
     };


     /* 幫class="gettext"的元素增加gettext屬性，並且其值等於tag內容,方便之後據此轉換適合語系字串 */
     $.i18n.setAnchorByClass = function ( className ) {
       $( '.' + className ).each( function () {
          // console.log(this);
          switch( $(this)[0].tagName ) {
              case "SPAN":
              case "DIV":
              case "TITLE":
	      case "BUTTON":
                  // console.log("span/div");
                  $(this).attr( 'gettext', $(this).text() );
                  break;
              case "INPUT":
                  $(this).attr( 'gettext_value', $(this).attr('value') );
                  $(this).attr( 'gettext_placeholder', $(this).attr('placeholder') );
                  $(this).attr( 'gettext', $(this).attr('alt') );
		  break;
              case "IMG":
                  // console.log("img");
                  $(this).attr( 'gettext', $(this).attr('alt') );
                  break;
              case "ABBR":
              case "CITE":
	      case "A":
                  $(this).attr( 'gettext_text', $(this).text() );
                  $(this).attr( 'gettext_title', $(this).attr('title'));
                  break;
          }
       });
     };


     // get user language setting into  $.i18n.lang
     $.i18n.setLocale( ( navigator.language || navigator.userLanguage ).replace('-', '_') );


     // replace String from html attribute
     $.i18n.replace = function ( anchor ) {
        $("." + anchor).each( function () {
          console.log(this);
          switch( $(this)[0].tagName ) {
              case "SPAN":
              case "DIV":
              case "TITLE":
	      case "BUTTON":
                  //console.log("span/div/title");
                  // $(this).html( $._( $(this).attr( anchor ).match( /\w+/ ) ) );
                  $(this).html( $._( $(this).attr(anchor) ) );
                  break;
              case "INPUT":
                  $(this).attr('value', $._( $(this).attr( anchor + "_value" )) );
                  $(this).attr('placeholder', $._( $(this).attr( anchor + "_placeholder" )) );
                  $(this).attr('alt', $._( $(this).attr( anchor )) );
		  break;
              case "IMG":
                  //console.log("img");
                  $(this).attr('alt', $._( $(this).attr( anchor )) );
                  break;
              case "ABBR":
              case "CITE":
	      case "A":
                  //console.log("abbr/cite")
                  $(this).html( $._( $(this).attr( anchor + "_text" )) );
                  $(this).attr('title', $._( $(this).attr( anchor + "_title" )) );
                  break;
          } 
        });
     };


     /* record js/json have be loaded before */
     $.i18n.hadJS = { };

     /* follow locale setting to call replace() change current string */
     $.i18n.replaceByLocale = function ( jsFileName ) {
       if( $._.hadJS[ jsFileName ] ) {
         $._.replace( "gettext" );
       } else {
         $.getScript( jsFileName )
           .done( function (script, textStatus ) {
             console.log( "load the file success : " + jsFileName );
             $._.replace( "gettext" );
             $._.hadJS[ jsFileName ] = true;
           })
           .fail( function(jqxhr, settings, exception ) {
             console.error( "Can't find the file : " + jsFileName );
           });
       };
     };





     /**
      * Converts a number to numerals in the specified locale. Currently only
      * supports devanagari numerals for Indic languages like Nepali and Hindi
      * @param {Number} Number to be converted
      * @param {locale} locale that number should be converted to
      * @returns {String} Unicode string for localized numeral 
      */
     $.i18n._n = function(num, locale) {

	 locale = locale || $.i18n.lang;

	 if (!this.i18n[locale] || !this.i18n[locale].numBase ) {
	     return num;
	 }


	 //48 is the base for western numerals
	 var numBase = $.i18n[$.i18n.lang].numeralBase || 48;
	 var prefix =  $.i18n[$.i18n.lang].numeralPrefix || "u00";
     
	 var convertDigit = function(digit) {	     
	     return '\\' + prefix + (numBase + parseInt(digit)).toString(16);
	 };
	 
	 var charArray = num.toString().split("").map(convertDigit);
	 return eval('"' + charArray.join('') + '"');
     };

     $._n = $.i18n._n;

     /* ToDo
      * implement sprintf
      * conversion functions for monetary and numeric 
      * sorting functions (collation) for different locales
      */

 })(jQuery);
