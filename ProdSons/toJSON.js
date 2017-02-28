var startMarker = new Array();
var durationMarker = new Array();

function add(i){
	startMarker[startMarker.length]=i;
	if(typeof(startMarker[startMarker.length-2])!= 'undefined'){
		durationMarker[durationMarker.length]=startMarker[startMarker.length-1]-startMarker[startMarker.length-2];
	}
}

function addLastDuration(i){
	durationMarker[durationMarker.length] = i;
}

function toJson(filename){
	var myDict = new Dict("myDict");
	myDict.clear();
	myDict.append('time',startMarker);
	myDict.append('duration',durationMarker);
	myDict.append('compte', startMarker.length);
	myDict.export_json(filename);
}

function clearAll(){
	startMarker.splice(0,startMarker.length);
	durationMarker.splice(0,durationMarker.length);
}

function compte(){
	var myDict = new Dict("myDict");
	var co = myDict.get("time").length;
	outlet(0,co);
}