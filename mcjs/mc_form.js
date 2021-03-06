const gw='http://127.0.0.1:8080'
let tic = getTic();

let pee = existsPeerId()
    .then(res => {console.log('res ',res); return res});
console.log('pee ',pee);

const myform = document.getElementsByTagName('form')[0]

let promises = [
    getCfIp().then( resolve(myform,'ip') ),
    getPeerId().then( resolve(myform,'peerid') )
];

// fill myform with ip and peerid
Promise.all(promises)
    .then(
	x => {
	    [ip, peerid] = x
	    console.log('Promise.all : ip '+ip);
	    console.log('Promise.all : peerid '+peerid);
	}
    )

function process(form) { // onclick 
    let query = getQuery(form);
    ipfsLogAppend('/var/logs/forms.log',query+'&tic'+tic)
	.then( hash => {
	    console.log("process hash: ",hash);
	    document.getElementById('hash').innerHTML = '<a href="'+gw+'/ipfs/'+hash+'">'+hash+'</a>';
	})
	.catch(logError)
	    
	    let id = query2json(query)
    console.log(id)
}

function resolve(form, name) {
    return substi = x => { addInput(form, name, x); return x };
}

// update input element w/i form
function addInput(form, name, value) {
    console.log("addInput : input form ",form);
    console.log("addInput : input name '"+name+"'");
    console.log("addInput : input value '"+value+"'");
    
    let e = form.elements[name];
    if (typeof e != 'undefined') {
	e.value = value;
    } else {
	let s = document.createElement('span'); s.innerHTML = name + ' :'
	form.insertBefore(s,form.elements['button']); 
	
	let i = document.createElement('input');
	i.setAttribute('name', name);
	i.setAttribute('type', 'text');
	i.setAttribute('value', value);
	i.setAttribute('size', 50);
	i.disabled = true;
	
	form.insertBefore(i, form.elements['button']);
	
	let b = document.createElement('br');
	form.insertBefore(b, form.elements['button']);
    }
}

function ipfsLogAppend(mfspath, record) {
    console.log("ipfsLogAppend : input mfspath ",mfspath);
    console.log("ipfsLogAppend : input record ",record);
    
    const api_url = 'http://127.0.0.1:5001/api/v0/'
    return createParent(mfspath)
	.then( _ => getMFSFileSize(mfspath))
	.then( offset => {
	    var url = api_url + 'files/write?arg=' + mfspath + '&create=1&offset='+offset;
	    console.log("ipfsLogAppend offset: ",offset);
	    return fetchPostText(url, record+"\n")
		.then( _ => getMFSFileHash(mfspath)) 
		.catch(logError)
		    })
	.catch(logError)
	    }

function createParent(path) {
    console.log("createdParent : input path '"+path+"'");
    
    const api_url = 'http://127.0.0.1:5001/api/v0/'
    let dir = path.replace(new RegExp('/[^/]*$'),'');
    var url = api_url + 'files/stat?arg=' + dir + '&size=true'
    return fetchGetJson(url)
	.then( json => {
	    console.log("createdParent json ",json);
	    if (typeof(json.Code) == 'undefined') {
		console.log("createdParent dir '"+dir+"'");
		return json;
	    } else {
		// {"Message":"file does not exist","Code":0,"Type":"error"}
		console.log('! -e '+dir);
		url = api_url + 'files/mkdir?arg=' + dir + '&parents=true'
		return fetch(url).then(
		    resp => {
			if (resp.text() == '') {
			    var url = api_url + 'files/stat?arg=' + dir + '&size=true'
			    return fetch(url).then( resp => resp.json() )
			} else {
			    Promise.reject(new Error(resp.statusText))
			}
		    })
		    .then ( obj => { console.log(obj) })
	    } 
	})
	.catch(logError)
}

function getMFSFileSize(mfspath) {
    const api_url = 'http://127.0.0.1:5001/api/v0/'
    var url = api_url + 'files/stat?arg=' + mfspath + '&size=true'
    return fetchGetJson(url)
	.then( json => { return (typeof json.Size == 'undefined') ? 0 : json.Size } )
	.catch(logError)
}

function getMFSFileHash(mfspath) {
    const api_url = 'http://127.0.0.1:5001/api/v0/'
    var url = api_url + 'files/stat?arg='+mfspath+'&hash=true'
    return fetchGetJson(url)
	.then( json => { return json.Hash} )
    	.catch(logError)
}

