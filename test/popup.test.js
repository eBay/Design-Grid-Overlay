describe('popup page', function(){

	this.timeout(4000);

	var FILENAME = 'src/popup.html';

	it('Test default params in popup menu', function(done){
		beforeLoadFn = function(){

		}

		page.open(FILENAME, function(){
			page.evaluate(function(){
				assert.equal(document.getElementById('largeColumns').value, 16);
				assert.equal(document.getElementById("smallColumns").value, 8);
			   assert.equal(document.getElementById("largeWidth").value, 960);
			   assert.equal(document.getElementById('viewports').checked, false);
			   assert.equal(document.getElementById('smallWidth').value, 768);
			   assert.equal(document.getElementById('gutters').value, 16);
			   assert.equal(document.getElementById('outterGutters').value, 16);
			})
			done();
		})
	})
})