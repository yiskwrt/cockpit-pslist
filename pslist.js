var output = document.getElementById("output");

document.querySelector(".container-fluid").style["max-width"] = "500px";

function pslist_run() {
    if(cockpit.hidden) {
        console.log("pslist stop");
	return;
    }
    //var proc = cockpit.spawn(["ps", "-A", "-o", "%c %C %p"]);
    var proc = cockpit.script("top -b -n 1 | tail -n +8 | head -10 | awk '{print $12,$9,$1}'");
    proc.done(pslist_success);
    proc.stream(pslist_output);
    proc.fail(pslist_fail);

    output.innerHTML = "";

    /*register handler at 2000 ms later*/
    setTimeout(pslist_run, 2000);
}

function pslist_success() {
}

function pslist_fail() {
}

function pslist_output(data) {
    draw_progress(data);
    output.append(document.createTextNode(data));
}

function draw_progress(data) {
	checkVector = 0;
	data.split('\n').forEach(function(value, idx, ary) {
		//if(idx==0) return;
		if(value=="") return;
		specs = value.split(/\s+/);

		/*checkif command matches task.key*/
		TaskItems.forEach(function(task, idx, ary){
			if(specs[0] == task.key) {
				tdelems = task.trelem.children;
				tdelems[1].textContent = specs[2];
				tdelems[2].firstChild.firstChild.style.width = ""+specs[1]+"%";
				checkVector |= (0x1 << idx);
			}
		});
	});
	/*scan again to set zero*/
	TaskItems.forEach(function(task, idx, ary){
		if((checkVector & (0x1 << idx)) == 0) {
			task.trelem.children[2].firstChild.firstChild.style.width = "0%";
		}
	});
}

function setup_table(table, taskitems) {
	taskitems.forEach(function(task, idx, ary){
		trElem = document.createElement("tr");
		trElem.innerHTML = 
			"<td>" + task.name + "</td>" + 
			"<td></td>" + 
			'<td><div class="progress"><div class="progress-bar"></div></div></td>';
		table.appendChild(trElem);
		task.trelem = trElem;
	});
}

// Send a 'init' message.  This tells the tests that we are ready to go
cockpit.transport.wait(function() { });

/* Show load of listed tasks */
TaskItems = [
	{name:"cockpit-bridge", key:"cockpit-br+", trelem:null}, 
	{name:"sshd", key:"sshd", trelem:null},
	{name:"dockerd", key:"dockerd", trelem:null},
];
setup_table(document.getElementById("tab_graph"), TaskItems);

/* Handle jumping locations */
cockpit.addEventListener("locationchanged", function() { })
cockpit.onvisibilitychange = function() {
    if(cockpit.hidden) {
	console.log("ev: hidden");
    } else {
	console.log("ev: visible");
	setTimeout(pslist_run, 1000);
    }
}

/* register measurement routine */
setTimeout(pslist_run, 1000);
