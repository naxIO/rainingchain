Draw.popup = function(){
	if(main.popupList.equip){Draw.popup.equip();}
}

Draw.popup.equip = function(){ ctxrestore();
	var s = Draw.popup.equip.main();
	if(!s) return;
	
	Draw.popup.equip.boost(s);
	Draw.popup.equip.frame(s);
	Draw.popup.equip.top(s);	
	Draw.popup.equip.boost(s);
}

Draw.popup.equip.main = function(){
	var w = 250;
	var h = 250;
	var pop = main.popupList.equip;
	ctx = List.ctx.win;
	
	if(typeof pop === 'object'){
		var id = pop.id;
		var posx = pop.x;
		var posy = pop.y;
	} else {
		var id = pop;
		var posx = Input.mouse.x;
		var posy = Input.mouse.y;
	}
	
	var equip = Db.equip[id];
	if(equip === undefined){Db.query('equip',id); return; }
	if(equip === 0){return;} //waiting for query answer
	
	var sx = Math.max(0,Math.min(posx-w,Cst.WIDTH-w));
	var sy = Math.max(0,Math.min(posy-h,Cst.HEIGHT - h));	
	
	return {
		'w':w,
		'h':h,
		'x':sx,
		'y':sy,
		'equip':equip
	};
}

Draw.popup.equip.frame = function(s){
	ctx.globalAlpha = 0.9;
	ctx.fillStyle = "#696969";
	ctx.strokeStyle="black";
	ctx.drawRect(s.x,s.y,s.w,s.h);
	ctx.globalAlpha = 1;
}

Draw.popup.equip.top = function(s){
	//Draw icon
	Draw.icon(s.equip.visual,[s.x+2,s.y+2],48);
	
	//Draw Name
	ctx.font="25px Monaco";
	ctx.fillStyle = s.equip.color;
	ctx.textAlign = 'center';
	ctx.fillTextU(s.equip.name,s.x + 150,s.y);
	ctx.textAlign = 'left';
	ctx.fillStyle = 'white';
	
	ctx.font="15px Monaco";
	var string = 'Lv:' + s.equip.lvl + '  Orb: +' + round(s.equip.orb.upgrade.bonus*100-100,2) + '% | ' + s.equip.orb.upgrade.amount;
	ctx.fillText(string,s.x+50+5,s.y+28);
	
	//Draw Def/Dmg
	ctx.font="25px Monaco";
	ctx.textAlign = 'center';
	var num = s.equip.category === 'armor' ? s.equip.dmgMain :  s.equip.defMain;
	var bar = s.equip.category === 'armor' ? Draw.popup.equip.getDef(s.equip) : s.equip.dmgRatio;
	ctx.fillText(round(num,0),s.x+25,s.y+50);
	Draw.element(s.x+52,s.y+50,190,25,bar);
	
	
	//Separation
	ctx.beginPath();
	ctx.moveTo(s.x,s.y+80);
	ctx.lineTo(s.x+s.w,s.y+80);
	ctx.stroke();
}

Draw.popup.equip.boost = function(s){
	//Boost
	ctx.font="20px Monaco";
	ctx.textAlign = 'left';
	var numY = s.y+80;
	var sum = 0;
	for(var i in s.equip.boost){
		var boost = s.equip.boost[i];
		var info = Draw.convert.boost(boost);
		ctx.fillText('-' + info[0],s.x+10,numY+sum*20);
		ctx.fillText(info[1],s.x+10+150,numY+sum*20);
		sum++;	
	}
}

Draw.popup.equip.getDef = function(equip){
	var tmp = {};
	for(var j in Cst.element.list){
		var i = Cst.element.list[j];
		tmp[i] = equip.defMain * equip.defRatio[i] * equip.orb.upgrade.bonus;
	}
	return tmp;
}