Quest.challenge = {};
Quest.challenge.toggle = function(key,qid,bid){
	//when a player click on a quest bonus
	var mq = List.main[key].quest[qid];
	
	mq.challenge[bid] = !mq.challenge[bid];
	
	if(mq.challenge[bid]){
		Db.quest[qid].challenge[bid].add(key);
		Chat.add(key,'Bonus Turned On.');
	} else {
		Db.quest[qid].challenge[bid].remove(key);
		Chat.add(key,'Bonus Turned Off.');
	}
	
	Quest.challenge.update(key,qid);	
}
Quest.challenge.update = function(key,qid){
	var mq = List.main[key].quest[qid];
	
	var mod = 1;
	for(var i in mq.challenge){
		if(mq.challenge[i])	mod *= Db.quest[qid].challenge[i].bonus; 
	}
	mq.bonus.challenge = mod;
}

Quest.reward = function(key,id){
	//roll the perm stat bonus and check if last one was better
	var mq = List.main[key].quest[id];
	var q = Db.quest[id];
	
	var bonusSum = mq.bonus.challenge * mq.bonus.orb * mq.bonus.cycle;
	
	//Stat
	var seed = {
		'quality':(bonusSum + 0.01*mq.complete-1)* q.reward.stat.mod ,
		'cap':Math.max(0.75,1-0.01*mq.deathCount)
	};
	
	var boost = Craft.boost(seed,q.reward.stat);
	
	Chat.add(key,"The quest reward is " + round(boost.value,4) + ' in ' + Db.stat[boost.stat].name + '.');
	
	if(mq.reward === null || boost.value >= mq.reward.value){
		Chat.add(key,"Congratulations! Your character grows stronger.");
		mq.reward = boost;
		mq.rewardTier = boost.tier;
		Actor.permBoost(List.all[key],'Quest',Quest.reward.stack(mq));
	} else {	
		Chat.add(key,"Unfortunately, your last reward for this quest was better. This means you will keep your old reward.");
	} 
	
	//Exp
	var exp = deepClone(q.reward.exp);
	for(var i in exp) exp[i] *= bonusSum;
	Skill.addExp.bulk(key,exp,false);
}
	
Quest.reward.stack = function(mq){
	var temp = [];
	for(var i in mq){
		if(mq[i].reward) temp.push(mq[i].reward);
	}
	temp = Actor.permBoost.stack(temp);
	return temp;
}
Quest.hint = {};
Quest.hint.update = function(key,id){
	List.main[key].quest[id].hint = Db.quest[id].hintGiver(key,List.main[key].quest[id]);
}

Quest.req = {};

Quest.req.update = function(key,id){
	//update the test about hte quest req (strike if done)
	var temp = '';	
	var q = Db.quest[id];
	
	for(var i in q.requirement){
		temp += q.requirement[i].func(key) ? '1' : '0';
	}
	List.main[key].quest[id].requirement = temp;
}


Quest.complete = function(key,id){
	var mq = List.main[key].quest[id];
	var q = Db.quest[id];
	Chat.add(key,"Congratulations! You have completed the quest \"" + q.name + '\"!');
	mq.complete++;
	
	Quest.reward(key,id);
	List.main[key].quest[id] = Quest.reset(mq,id);
	LOG(0,key,'Quest.complete',id);
}

Quest.reset = function(mq,qid){
	var keep = ['rewardTier','reward','complete'];
	var tmp = {};
	for(var i in keep) tmp[keep[i]] = mq[keep[i]];
	
	var newmq = Main.template.quest[qid]();
	for(var i in tmp) newmq[i] = tmp[i];
	
	return newmq;
}

Quest.orb = function(key,quest,amount){
	var mq = List.main[key].quest[quest];
	mq.orbAmount += amount;
	mq.bonus.orb = Craft.orb.upgrade.formula(mq.orbAmount);
}








