
//chartgen js
//michael king
//generates pert chart layouts with preset data sets

(function(global)
{
	//generates random integer between min and max inclusive
	function randInt(min,max)
	{
		return Math.floor(Math.random()*(max-min+1))+min;
	}    //constant layouts for the possible chart types
	const layouts=
	[
		{name:'classic',preds:{A:[],B:['A'],C:['A'],D:['B','C'],E:['D'],F:['D'],G:['E','F']},positions:{A:['5%','160px'],B:['22%','50px'],C:['22%','270px'],D:['40%','160px'],E:['58%','50px'],F:['58%','270px'],G:['76%','160px']}},
		{name:'splitmerge',preds:{A:[],B:['A'],C:['A'],D:['B'],E:['D'],F:['C'],G:['E','F']},positions:{A:['3%','160px'],B:['20%','80px'],C:['20%','240px'],D:['38%','80px'],E:['56%','80px'],F:['38%','240px'],G:['74%','160px']}},
		{name:'diamond',preds:{A:[],B:['A'],C:['A'],D:['C'],E:['B'],F:['D','E'],G:['F']},positions:{A:['5%','160px'],B:['22%','100px'],C:['22%','220px'],D:['40%','220px'],E:['40%','100px'],F:['58%','160px'],G:['76%','160px']}},
		{name:'parallel',preds:{A:[],B:['A'],C:['B'],D:['A'],E:['D'],F:['E'],G:['C','F']},positions:{A:['3%','160px'],B:['20%','80px'],C:['36%','80px'],D:['20%','240px'],E:['36%','240px'],F:['52%','240px'],G:['72%','160px']}},
		{name:'ladder',preds:{A:[],B:['A'],C:['A'],D:['B'],E:['C'],F:['D','E'],G:['F']},positions:{A:['2%','160px'],B:['16%','120px'],C:['16%','200px'],D:['30%','120px'],E:['30%','200px'],F:['50%','160px'],G:['72%','160px']}},
		{name:'zigzag',preds:{A:[],B:['A'],C:['B'],D:['A'],E:['C','D'],F:['E'],G:['F']},positions:{A:['3%','160px'],B:['20%','100px'],C:['38%','100px'],D:['20%','220px'],E:['56%','160px'],F:['72%','160px'],G:['88%','160px']}},
		{name:'converge',preds:{A:[],B:['A'],C:['A'],D:['B'],E:['C'],F:['D','E'],G:['F']},positions:{A:['2%','160px'],B:['18%','100px'],C:['18%','220px'],D:['34%','100px'],E:['34%','220px'],F:['56%','160px'],G:['76%','160px']}},
		{name:'complex',preds:{A:[],B:['A'],C:['B'],D:['B'],E:['C','D'],F:['E'],G:['F']},positions:{A:['2%','160px'],B:['16%','160px'],C:['30%','100px'],D:['30%','220px'],E:['46%','160px'],F:['62%','160px'],G:['78%','160px']}}
	];

	//preset task durations for each of the 10 data sets
	//each array has 7 numbers mapping to tasks a through g
	const presetSets=
	[
		[4,8,2,1,5,6,10],   //set 1
		[1,11,4,2,10,12,7], //set 2
		[3,5,12,9,2,11,4],  //set 3
		[4,6,10,8,1,12,2],  //set 4
		[4,10,8,3,6,1,5],   //set 5
		[1,2,11,7,5,3,12],  //set 6
		[8,9,3,5,6,10,7],   //set 7
		[7,11,5,8,12,3,9],  //set 8
		[9,10,2,4,3,1,11],  //set 9
		[5,12,10,8,7,2,4]   //set 10
	];

	//main chart generator takes optional layout 1 to 8 and set 1 to 10
	//omit both for full random or pass specific indices for reproducible charts
	function generateLayout(layoutIndex, setIndex)
	{
		//decide which of the 10 preset duration arrays to use
		let chosenSet;
		
		//check if caller passed explicit set index between 1 and 10
		if(typeof setIndex==='number' && setIndex>=1 && setIndex<=10)
		{
			//convert 1 based to 0 based array index
			chosenSet=setIndex-1;
		}
		else
		{
			//no valid setindex provided so check url query params
			//allows linking to specific quiz like game.html?set=3
			const params=new URLSearchParams(location.search);
			const s=parseInt(params.get('set')||params.get('data')||'',10);
			
			//validate url param is in range 1 to 10
			if(!isNaN(s) && s>=1 && s<=10)
			{
				chosenSet=s-1;
			}
			else
			{
				//no valid param either so pick random from 0 to 9
				chosenSet=randInt(0,9);
			}
		}

		//pick which layout pattern to use classic diamond parallel etc
		//if layoutindex passed and valid use it otherwise random
		const idx=(typeof layoutIndex==='number'&&layoutIndex>=1&&layoutIndex<=layouts.length)?layoutIndex-1:randInt(0,layouts.length-1);

		//get the selected layout object from array
		const layout=layouts[idx];

		//always 7 nodes labeled a through g
		const nodes=['A','B','C','D','E','F','G'];

		//empty object will hold all task data
		const tasks={};

		//loop through each node letter and build its task object
		for(const n of nodes)
		{
			//grab the chosen duration array
			const map=presetSets[chosenSet];
			
			//find position of current letter in alphabet string
			const nodeIndex='ABCDEFG'.indexOf(n);
			
			//pull duration from preset array at that position
			//fallback to random 1 to 12 if somehow index invalid
			const len=(nodeIndex>=0 && map[nodeIndex]!=null) ? Number(map[nodeIndex]) : randInt(1,12);

			//get xy position from layout object or default to center
			const pos=layout.positions[n]||['50%','160px'];

			//build full task object with all properties
			//slice pred array to avoid shared references
			//succ starts empty will populate next
			tasks[n]={id:n,len:len,pred:(layout.preds[n]||[]).slice(),succ:[],x:pos[0],y:pos[1]};
		}

		//now build successor lists and enforce max 2 outgoing arrows per node
		//this keeps diagrams readable prevents too many crossing lines
		const succCount={};

		//initialize all counts to zero
		for(const n of nodes)
		{
			succCount[n]=0;
		}

		//loop through and populate succ arrays while counting
		for(const n of nodes)
		{
			//get predecessor list for current task
			const preds=tasks[n].pred;
			
			//will hold filtered list excluding any that exceed limit
			const filteredPreds=[];

			//check each predecessor
			for(const p of preds)
			{
				//verify predecessor task actually exists
				if(tasks[p])
				{
					//only add if predecessor has less than 2 successors already
					if(succCount[p]<2)
					{
						//add current task to predecessor successor list
						tasks[p].succ.push(n);
						
						//increment successor count for that predecessor
						succCount[p]++;
						
						//keep this predecessor in filtered list
						filteredPreds.push(p);
					}
					//if succcount already 2 this pred gets dropped
					//breaks the dependency to keep diagram clean
				}
			}

			//replace original pred list with filtered version
			//removes any preds that were over limit
			tasks[n].pred=filteredPreds;
		}

		//build compact identifier string for answer key matching
		//format is like a4b8c2d1e5f6g10 lowercase letter plus duration
		let compact='';

		for(const n of nodes)
		{
			//concatenate lowercase letter and its duration
			compact+=n.toLowerCase()+tasks[n].len;
		}

		//return object with everything caller needs
		//tasks is main data compact for matching layoutindex and setindex for logging
		//layoutname is string like classic or diamond
		//convert indices back to 1 based for return
		return{tasks,compact,layoutIndex:idx+1,layoutName:layout.name,setIndex:chosenSet+1};
	}

	global.ChartGen={generateLayout:generateLayout,layoutCount:layouts.length,presetSets:presetSets};

	global.generateLayout=function(i,s)
	{
		return global.ChartGen.generateLayout(i,s);
	};

})(window);
