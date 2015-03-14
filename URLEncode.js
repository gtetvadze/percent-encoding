URLEncoder = {
	encode:function(input){
		var result;
		if(input.constructor === Array) {
			result = Array();
			for(var key in input){
				result[key] = encodeString(input[key]);	
			}
		} else if(typeof input == 'object') {
			result = "";
			var counter = 0;
			for(var key in input) {
				counter++;
				result += (key + "=" + encodeString(input[key]));
				if(counter >= Object.keys(input).length)break;
				result += "&";	
			}
		} else {
			result = encodeString(input);	
		}
		return (result);
	},
	decode:function(input){
		var result;
		if(input.constructor === Array) {
			result = Array();
			for(var key in input){
				result[key] = decodeString(input[key]);	
			}
			return result;
		} else {
			if(input.indexOf("=") > 0) {
				var ampSplit = input.split("&");
				result = {};
				for(key in ampSplit) {
					var eqSplit = ampSplit[key].split("=");
					result[eqSplit[0]] = decodeString(eqSplit[1]);
				}
				return result;

			} else {
				return decodeString(input);
			}
		}
	}	
}

function encodeString(input) {
	var output = "";
	inputS = input.toString();
	for(i in inputS){
		code = inputS.charCodeAt(i);
		if(code >= 123 || code <= 47 || (code >= 58 && code <= 64) || (code >= 91 && code <= 96) )
			output += encodeCharacter(inputS[i]);
		else
			output += inputS[i];
	}
	return output;
}

function encodeCharacter(character){
	var code = character.charCodeAt(0);

	var binaryCodeUTF16 = Number(code).toString(2);
	var binaryCodeUTF8 = "";
	var hexaCodeUTF8 = "";

	var percentEncoded = "";
		var counter = 0;
		var byteCounter = 0;
		if(code >= 0 && code < 128) {
			for(var i = 0;i < 8 - binaryCodeUTF16.length;i ++) {
				binaryCodeUTF8 += "0";
			}
			binaryCodeUTF8 += binaryCodeUTF16;
			hexaCodeUTF8 = parseInt(binaryCodeUTF8, 2).toString(16);
			for(i in hexaCodeUTF8) {
				if(i%2 == 0)
					percentEncoded += "%";
				percentEncoded += hexaCodeUTF8[i];
			}

			return percentEncoded;
		} 

		for(i = binaryCodeUTF16.length - 1;i >= 0;i --) {
			if(counter%6 == 0 && counter > 0) {
				binaryCodeUTF8 = "10" + binaryCodeUTF8;          
				byteCounter = 0;
			}
			binaryCodeUTF8 = binaryCodeUTF16[i] + binaryCodeUTF8;
			counter++;
			byteCounter++;
		}
		for(i = 0;i < (7 - counter/6 - byteCounter);i ++) {
			binaryCodeUTF8 = "0" + binaryCodeUTF8;
		}
		for(i = 0;i < counter/6;i ++) {
			binaryCodeUTF8 = "1" + binaryCodeUTF8;
		}

		hexaCodeUTF8 = parseInt(binaryCodeUTF8, 2).toString(16);


		for(i in hexaCodeUTF8) {
			if(i%2 == 0)
				percentEncoded += "%";
			percentEncoded += hexaCodeUTF8[i];
		}
		return percentEncoded;
}

function decodeString(input){
	var hexArray = input.split("%");
	var result = "";
	result += hexArray[0];

	hexArray.splice(0,1);
	var decArray = getDecFromHexArray(hexArray);

	for(octetCounter = 0; octetCounter < decArray.length; octetCounter ++) {
		binaryCodeUTF8 = "";
		var encodedPart = "";
		var xorNum = 0;
		var foll = followers( decArray[octetCounter][0] );

		if( foll > 0) {
			var x = 128;
			for(i = 0;i < foll + 1;i ++) {
				xorNum += x;
				x /= 2;
			}
			binaryCodeUTF8 += ((decArray[octetCounter][0] ^ xorNum).toString(2));	
		} else {
			binaryCodeUTF8 += decArray[octetCounter][0].toString(2);

			//continue;
		}
		octetCounter++;
		var lastOctet = octetCounter + foll;
		for(;octetCounter < lastOctet; octetCounter ++) {
			octetBin = (decArray[octetCounter][0] ^ 128).toString(2);
			var zeros = "";
			for(i = 0;i < (6 - octetBin.length);i ++) {
				zeros += "0";
			}
			octetBin = zeros + octetBin;
			binaryCodeUTF8 += octetBin;
		}
		octetCounter--;

		result += String.fromCharCode( parseInt( binaryCodeUTF8,2 ));
		result += decArray[octetCounter][1];
	}

	return result;
}


function followers(octDecimal) {

	if(octDecimal >= 0 && octDecimal <= 127) {
		return 0;
	} else if(octDecimal >= 192 && octDecimal <= 223) {
		return 1;
	} else if(octDecimal >= 224 && octDecimal <= 239) {
		return 2;
	} else if(octDecimal >= 240 && octDecimal <= 247) {
		return 3;
	} else if(octDecimal >= 248 && octDecimal <= 251) {
		return 4;
	} else if(octDecimal >= 252 && octDecimal <= 253) {
		return 5;
	}
}

function getDecFromHexArray(hexArray){
	var arr = new Array();
	for(i in hexArray) {
		arr[i] = new Array();
		arr[i][0] = parseInt((hexArray[i].charAt(0) + hexArray[i].charAt(1)),16);
		arr[i][1] = hexArray[i].substr(2);
	}

	return arr;
}

