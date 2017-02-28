myLive = new LiveAPI("live_set tracks 0 clip_slots 0 clip ");
post('\n------------------------------------\n');
post(myLive.children+'\n');
post(myLive.info);
post(myLive.get('is_playing'));
test();

function test(){
	myLive.gain = Math.random();
}		