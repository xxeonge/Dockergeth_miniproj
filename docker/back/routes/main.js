module.exports = function(app)
{
    app.get('/',function(req,res){
        res.render('index.html');
    });

    app.get('/submit',function(req,res){
        res.render('submit.html');
    });

    app.get('/verify',function(req,res){
        res.render('verify.html');
    });

}