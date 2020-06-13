
module.exports = function(app){


    app.get('/main',(req,res) => { //if app gets "/login"
    res.render('index')// render it to login.handlebars
});
app.get('/',(req,res) => { //if app gets "/login"
    res.render('createorjoin')// render it to login.handlebars
});

app.post('/create',(req,res)=>{ // if app gets "/" and is logged in
res.redirect('/created')
});

app.get('/created',(req,res)=>{ // if app gets "/" and is logged in
console.log("req room",roomAvail[0]);// print user details
res.render('created',{ // response by rendering to home.handlebars
    yourRoom : roomAvail[0] })
});

app.post('/join',(req,res)=>{ // if app gets "/" and is logged in
res.redirect('/main')
});

};

