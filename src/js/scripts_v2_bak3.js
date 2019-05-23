
/* !VA  
CURRRENT - Where to initialize Appdata and whether it needs to be populated in initializeDevMode. It should be initialized only once at the top of UIController and then just populated fully in getAppData and then updated as necessary whenever a UI update is required.
1) Since we're still working in DEV mode, see if we can evaluate the dev image by calling UIController.getAppData.


*/
//SCRIPT START
//PAGE SETUP START

// Namespace
var Dimwhit = (function () {

  var UIController = (function() {

    // !VA This is where Appdata should be initialized
    var Appdata = {};

    // !VA DimViewer ID strings
    var dimViewers = {
      filename: '#filename-viewer',
      display: '#dim-viewer-display',
      diskimg: '#dim-viewer-disk-img',
      aspect: '#dim-viewer-aspect',
      smallphones: '#dim-viewer-small-phones',
      largephones: '#dim-viewer-large-phones',
      retina: '#dim-viewer-retina',
      clipboardBut: '#clipboard-but'
    };

    // !VA toolButton ID Strings
    var toolButtons = {
      viewerWidth: '#main-image-viewer-wdth',
      grow50: '#main-image-grow-50',
      grow10: 'main-image-grow-10',
      grow01: 'main-image-grow-01',
      customWidth: 'main-img-custom-wdth',
      toggleImgSize: 'toggle-image-size',
      customHeight: 'main-img-custom-hght',
      shrink01:'main-image-shrink-01',
      shrink10: 'main-image-shrink-10',
      shrink50: 'main-image-shrink-50',
      sPhoneWidth: 'small-phones-wdth',
      lPhoneWidth: 'large-phones-wdth',
    };

    //!VA If we separate this out into UI objects that correspond to the objects we want to create, then we can just loop through them rather than define each property separately. So, dynamicElements are those that resize based on the current image... but I haven't figured out how to loop through them yet.
    var dynamicRegions = {
      curImg: '#main-img',
      imgViewer: '#main-image-viewer',
      imgViewport: '#image-viewport',
      appContainer: '#app-container',
    };

    var staticRegions = {
      dropArea: '#drop-area',
      toolsContainer: '#tools-container',
      ccpContainer: '#ccp',
    };

    // !VA  ccpUserInput ID Strings
    // !VA imgAnchor is just a flag for the status of the checkbox. The actual propStrings have to have an Open and Close property.
    var ccpUserInput = {
      imgClass: '#img-class-input',
      imgAnchor: '#img-anchor-checkbox',
      imgAlt: '#img-alt-input',
      // !VA This isn't even a thing... probably delete it 04.28.19
      imgAlign: '#img-align-select',
      imgRelPath: '#img-relpath-input',
      tdClass: '#td-class-input',
      tdAlign: '#td-align-select',
      tdValign: '#td-valign-select',
      tableClass: '#table-class-input',
      tableAlign: '#table-align-select',
      tableWidth: '#table-width-select',
      tableMaxWidth: '#table-max-width-input',
    };

    // !VA ccpPropStrings ID Strings
    // !VA V2 - This doesn't go here, probably belongs in the App Controller module, but we'll build it here for now and move it later.
    // Stores the strings representing the HTML properties corresponding to the user CCP selections. These property snippets will be used to populate the clipboard.
    // !VA Have to include separate propStrings for opening and closing tags 
    var ccpPropStrings = {
      imgClass: '',
      imgAnchorOpen: '',
      imgAnchorClose: '',
      imgAlt: '',
      imgAlign: '',
      imgRelPath: '',
      imgWidth: '',
      imgMaxWidth: '',
      tdClass: '',
      tdAlign: '',
      tdValign: '',
      tableClass: '',
      tableAlign: '',
      tableWidth: ''
    };

    // !VA ccpBuildTag ID Strings
    // Stores the ccpMakeTag object for assembling the clipboard create tag buttons
    // !VA V2 Also doesn't belong here, we will move it later.
    var ccpBuildTag = {
      imgBuildHTMLBut: '',
      imgBuildCSSBut: '',
      smallPhonesBuildCSSBut: '',
      largePhonesBuildCSSBut: ''
    };


 
    // !VA  This object only contains HTML elements whose properties change based on the properties of the image that is contained in them. It does NOT need to have a Constructor because it's not serving as the blueprint for any other objects.
    // !VA  We are initializing this here, and it will be updated
    // Appobj = {
    //   currentimg: document.querySelector(dynamicRegions.curImg),
    //   viewer: document.querySelector(dynamicRegions.imgViewer),
    //   viewport: document.querySelector(dynamicRegions.imgViewport),
    //   appcontainer: document.querySelector(dynamicRegions.appContainer)
    // };

    /* !VA  I don't remember what this was for. 
    function getCurIasdasfdmg(curImg, fileName) {
      var a, b;
      a = curImg;
      b = fileName;
      document.querySelector(staticRegions.dropArea).style.display = 'none';
      const curImgDiv = document.createElement('div');
    
      // Assign an id to the new div -- we're not adding this to an object because it's created here and is only used here. NOTE: These containers divs don't appear in devMode when the curImg is accessed from the index.html 
      curImgDiv.id = 'main-img-container';
      // Insert main-img-container into the existing main-image
      document.getElementById('main-image').insertBefore(curImgDiv, null);
      // !VA insert main-img-container into the newly-created main-img-container
      document.getElementById('main-img-container').insertBefore(dynamicRegions.curImg, null);
      // Create the image object and read in the binary image from the FileReader object.
      // This allows access of image properties. You can't get image properties from a FileReader object -- it's just a blob' 

    }
    */


    // !VA Functions that get returned from the UIContoller object go here
    return {
      // !VA V2 Return all the strings for the UI element's IDs
      getDimViewerIDs: function() {
        return dimViewers;
      },
      getToolButtonIDs: function() {
        return toolButtons;
      },
      getDynamicRegionIDs: function() {
        return dynamicRegions;
      },
      getStaticRegionIDs: function() {
        return staticRegions;
      },
      getCcpPropStringsIDs: function() {
        return ccpPropStrings;
      },
      getCcpUserInputIDs: function() {
        return ccpUserInput;
      },
      getCcpBuildTagIDs: function() {
        return ccpBuildTag;
      },

      //FILEREADER OBJECT PROCESSING
      //Get the user-selected image file object 
      handleFileSelect: function(evt) {
        console.log('RUnning HandleFileSelect');
        // If a file is already being displayed, i.e. Appdata.filename is true, then remove that image to make room for the next image being dropped
        // !VA TODO:
        if (Appdata.currentimg) {
          // !VA 03.18.18 Don't need the var declaration anymore - it's in the appRegions object
          // var curImg = document.getElementById('main-img');
          dynamicRegions.curImg.parentNode.removeChild(dynamicRegions.curImg);
        }
        // console.log('HANDLEFILESELECT');
        //The drop event has been executed and handleFileSelect is running.
        // !VA Can't remember what this does...    
        evt.stopPropagation();
        evt.preventDefault();
        //dataTransfer object is used to hold object data during a drag operation
        var files = evt.dataTransfer.files; // FileList object.
        // files is a FileList of File objects. List some properties.
        //Note that the File objects are blob objects that include the parameter
        // type, which indicates the type of file. 
        // console.log('files is: ' + files);
        // !VA I don't think the output array is used here, so commenting out.
        // var output = [];
        // !VA get the number of files selected
        // console.log('files.length is:' + files.length);
        
        var f =  files[0];
        // console.log('f.name is: ' + f.name);
        // !VA this for loop would be used if we were using the entire filelist instead of just one
        // a single dropped file
        // for (var i = 0, f; f = files[i]; i++) {
        // console.log('files[i].name is: ' + files[i].name);
        // Only process image files.
        //This is the query for file type -- it includes any MIME type that starts 
        //with 'image' which is a huge list of possible formats -- see the complete
        //list of MIME formats. Best to narrow that down to JPG, GIF, PNG -- not sure
        //about SVG and VML, they're not in the big list of MIME types I found 
        // !VA Need to handle this error
        if (!f.type.match('image.*')) {
          console.log('NOT IMAGE');
          var target = "notimage";
          // console.log('target is: ' + target);
          // !VA Below is the error handler - skipping for now
          // var isErr = errorHandler(target, 0, 0);
          console.log('!VA Not an image file error: Exiting...');
          return;
        }
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            // Create the image object        
            var curImg = new Image();
            // !VA create the id
            curImg.id = 'main-img';
            // !VA assign the blob in e.target.result to the source of the image
            // curImg.src = e.target.result;
            curImg.src = e.target.result;
            let fileName;
            // Read the filename of the FileReader object into a variable to pass to the getCurImage function, otherwise the blob has no name
            fileName = theFile.name;
            // Pass the FileObject i.e. new Image object to the function that gets the image data
            // !VA  03.18.18 Put the curImg created with FileReader in the appRegions object

            console.log('Showing curImg...');

            // !VA Hide the dropArea
            document.querySelector(staticRegions.dropArea).style.display = 'none';

            var Appobj = {
              currentimg: curImg,
              viewer: document.querySelector(dynamicRegions.imgViewer),
              viewport: document.querySelector(dynamicRegions.imgViewport),
              appcontainer: document.querySelector(dynamicRegions.appContainer)
            };

            // var curImg = 'img/TEST/BikeMedium.jpg';
            console.dir(curImg);
            // var div3 = document.createElement('div');
            // div3.id = 'div3';
            // document.getElementById('id2').insertBefore(div3, null);
            var mess;
            // !VA Get element properties here
            function getElementProperties(mess) { 

              setTimeout(() => {
                
                console.log('mess is: ' + mess);
                // !VA 

                document.querySelector(dynamicRegions.curImg).style.display = 'block';
                var foo = document.querySelector(dynamicRegions.curImg).width;
                console.log('foo is: ' + foo);
                Appobj.currentimg = document.querySelector(dynamicRegions.curImg);
  
  
                console.log('Appobj.currentimg is...');
                console.dir(Appobj.currentimg);
                // !VA Call 
                Appdata = UIController.getAppData(Appobj, fileName);
                calcController.evalViewerSize(Appdata);

              }, 250);
        
              // document.querySelector(dynamicRegions.curImg).style.display = 'block';
      
            }
            // !VA Write elements to DOM here
            function writeImgToDOM(curImg, callback) {
              // VA! This callback function allows access of image properties. You can't get image properties from a FileReader object -- it's a binary blob that takes time to load, and by the time it's loaded all the functions that get its properties have run and returned undefined. Temporary solution: hide the image object for 250 ms, then show it and get the properties -- by then it should have loaded. There is a better way to do this with promises but that will have to be for later.
              // !VA Create a div in the DOM
              var curImgDiv = document.createElement('div');
              // !VA Assign the new div an id that reflects its purpose
              curImgDiv.id = 'main-img-container';
              // Insert main-img-container into the existing main-image inside the main-image div.
              document.getElementById('main-image').insertBefore(curImgDiv, null);
              // !VA insert the new curImg into the new main-img container
              document.getElementById('main-img-container').insertBefore(curImg, null);
              // Create the image object and read in the binary image from the FileReader object.
              // This allows access of image properties. You can't get image properties from a FileReader object -- it's just a blob' 
              // !VA Hide the DOM element while the blob loads.
              document.querySelector(dynamicRegions.curImg).style.display = 'none';

              callback(curImg);		
            }
        
            writeImgToDOM(curImg, getElementProperties);

          };
        })(f);
        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
        // }
        
      },
      //FILEREADER OBJECT PROCESSING END


      /* DOn't need this anymore, since it didn't work and the callback function does work
      getCurImg: function () {
        console.log('getCurImg running');

        // var curImg = document.getElementById('main-img');
        var curImgDiv = document.createElement('div');

        curImgDiv.id = 'main-img-container';
        // curImgDiv = 'main-img-container';
        // Insert main-img-container into the existing main-image
        document.getElementById('main-image').insertBefore(curImgDiv, null);
        // !VA insert main-img-container into the newly-created main-img-container
        document.getElementById('main-img-container').insertBefore(curImg, null);
        // Create the image object and read in the binary image from the FileReader object.
        // This allows access of image properties. You can't get image properties from a FileReader object -- it's just a blob' 
        var curImg = document.getElementById('main-img');

        
        return foo;

      },
      */

      // !VA Populate Appdata using the properties of the dynamic regions in the 
      // !VA  Appdata can only be populated if there's an image. If the DEV image isn't loaded or the USER hasn't dropped in an image yet, then Appdata.filename is undefined and script won't run.
      // !VA  I think I fixed the above problem by creating a different function for Dev initialization. It can be messy and not DRY since it's not for production anyway.
      getAppData: function(Appobj, filename) {
        // console.log('getAppData: Appdata.currentimg is...');
        // console.log(Appdata.currentimg.src);
        // console.log('Appobj,currentimg is...');
        // console.dir(Appobj.currentimg);
        // var curimgwidth = Appobj.currentimg.width;
        // console.log('curimgwidth: ' + curimgwidth);

        // var Appobj = {
        //   currentimg: dynamicRegions.curImg,
        //   viewer: document.querySelector(dynamicRegions.imgViewer),
        //   viewport: document.querySelector(dynamicRegions.imgViewport),
        //   appcontainer: document.querySelector(dynamicRegions.appContainer)
        // };
        
        // !VA If there's no current image, then return false. This is the flag to the initializeDOM function that there is no DEV image in the HTML. The init then shows the drop area and 'No Image' in the dimViewers.
        if (Appobj.currentimg == null || Appobj.currentimg === 'undefined') {
          return false;
        } else {
          // !VA  There is a current image, so populate Appdata based on the object properties in Appdata
          Appdata = {
            // filename: 'blob',
            // STOP HERE -- I don't understand how to get a funcion return value and set it a property.
            filename: filename,
            imgH: Appobj.currentimg.height,
            imgW: Appobj.currentimg.width,
            imgNH: Appobj.currentimg.naturalHeight,
            imgNW: Appobj.currentimg.naturalWidth,
            aspect: function() {
              var a = calcController.getAspectRatio(this.imgNW, this.imgNH);
              return a;
            },
            // !VA These values are now initialized in CSS based on the size of dropArea -- probably need to revisit this, not sure why the style needs to be queried.
            viewerH: parseInt(Appobj.viewer.style.height),
            viewerW: parseInt(Appobj.viewer.style.width),
            viewportH: parseInt(Appobj.viewport.style.height),
            viewportW: parseInt(Appobj.viewport.style.width),
            appH: parseInt(Appobj.appcontainer.style.height),
            appW: parseInt(Appobj.appcontainer.style.width),
      
          };
          console.log('getAppData: Appdata is...');
          console.table(Appdata);
          console.log('Appdata.filename is: ' + Appdata.filename);
          console.log('getAppData: Appdata.filename is: ' + Appdata.filename);
          console.log('getAppData: aspect ratio is: ' + Appdata.aspect()[1]);
          return Appdata;
          
        }
      },




      // OBJECT AND DISPLAY REFRESH FUNCTIONS
      // This is where we pass in the recalculated Appdata data and update the onscreen display of the Appdataect data in the dimViewers 
      refreshAppUI: function (Appdata) {
        // The page has been initialized but no image has been selected yet, so set all the dimViewers to No Image.
        console.log('refreshAppUI running...');
        // !VA Appdata is still empty, so show 'No Image' in the dimViewers and hide the clipboard button.
        if (!Appdata.filename) {
          document.querySelector(dimViewers.clipboardBut).style.display = 'none';
          const dimarray = Object.values(dimViewers);
          for ( let i = 0; i < dimarray.length; i++ ) {
            if ( dimarray[i] !== '#clipboard-but' &&  dimarray[i] !== '#filename-viewer' ) {
              document.querySelector(dimarray[i]).innerHTML = `<span class='pop-font'>&nbsp;&nbsp;No Image</span>`;
            } 
          } 
          // return;
        } else {
          // !VA Write the dimViewers to the UI based on Appdata values and show the clipboard button
          document.querySelector(dimViewers.clipboardBut).style.display = 'block';
          // Filename
          document.querySelector(dimViewers.filename).innerHTML = Appdata.filename;
          // Current image display dimensions
          document.querySelector(dimViewers.display).innerHTML = `<span class='pop-font'><span id="display-size-width">${Appdata.imgW}</span> X <span id="display-size-height">${Appdata.imgH}</span></span>`;
          // !VA Dimensions on disk, i.e. natural dimensions
          document.querySelector(dimViewers.diskimg).innerHTML = `<span class='pop-font'>${Appdata.imgNW} X ${Appdata.imgNH}</span>` ;
          // Aspect ratio
          document.querySelector(dimViewers.aspect).innerHTML = `<span class='pop-font'>${calcController.getAspectRatio(Appdata.imgNW, Appdata.imgNH)[1]}</span>` ;
          // Small phone dimensions
          // VA! Calculate the height of the image if the width is whatever the small device width is, here 320 pixels
          // !VA  ALL these values need to be put in a global object
          // 
          // // !VA use object instead const smallphonewidth = 320;
          Appdata.sPhoneH = Math.round(Appdata.sPhoneW * (1 / calcController.getAspectRatio(Appdata.imgNW, Appdata.imgNH)[0]));
          document.querySelector(dimViewers.smallphones).innerHTML = `<span class='pop-font'><span id='small-phones-width'>${Appdata.sPhoneW}</span> X <span id='small-phones-height'>${Appdata.sPhoneH}</span></span>` ;
          // Large phone dimensions
          // Calculate the height of the image if the width is whatever the large device width is, here 480 pixels
          // !VA use object instead const largephonewidth = 480;
          Appdata.lPhoneH = Math.round(Appdata.lPhoneW * (1 / calcController.getAspectRatio(Appdata.imgNW, Appdata.imgNH)[0]));
          document.querySelector(dimViewers.largephones).innerHTML = `<span class='pop-font'><span id='large-phones-width'>${Appdata.lPhoneW}</span> X <span id='large-phones-height'>${Appdata.lPhoneH}</span></span>` ;
          // Retina dimensions are twice the display dimensions
          document.querySelector(dimViewers.retina).innerHTML = `<span class='pop-font'>${2 * Appdata.imgW}</span> X <span class='pop-font'>${2 * Appdata.imgH}`;

          // !VA Adjust the image container heights based on the Appdata values calculated in adjustContainerHeights
          console.log('refreshAppUI: Appdata is...');
          console.dir(Appdata);
          console.log(document.querySelector(dynamicRegions.imgViewer).style.width);
          console.log(document.querySelector(dynamicRegions.imgViewer).style.height);
          document.querySelector(dynamicRegions.curImg).style.width = calcController.intToPx(Appdata.imgW);
          document.querySelector(dynamicRegions.curImg).style.height = calcController.intToPx(Appdata.imgH);
          document.querySelector(dynamicRegions.imgViewer).style.width = calcController.intToPx(Appdata.viewerW);
          document.querySelector(dynamicRegions.imgViewer).style.height = calcController.intToPx(Appdata.viewerH);
          document.querySelector(dynamicRegions.imgViewport).style.width = calcController.intToPx(Appdata.viewportW);
          document.querySelector(dynamicRegions.imgViewport).style.height = calcController.intToPx(Appdata.viewportH);
          // document.querySelector(dynamicRegions.appContainer).style.width = calcController.intToPx(Appdata.appW);
          document.querySelector(dynamicRegions.appContainer).style.height = calcController.intToPx(Appdata.appH);


          // !VA Show the dimension alerts if an image too large or small...
          // showDimensionAlerts();


          return Appdata, dimViewers;

        }
      },

    };




  })();
  // var r = UIController.getAppdata();
  // console.dir(r);



  // !VA Calculations Controller Contructor
  var calcController = (function() {

    // var data = UIController.getAppData();
    // console.log('data is: ' + data);



    return {
      //STRING FUNCTIONS
      // !VA Convert integer to pixel
      intToPx: function(int) {
        let pxval;
        let str = String(int);
        pxval = str + 'px';
        return pxval;
      },
      //STRING FUNCTIONS

      getAspectRatio: function (var1, var2) {
        // console.log('getAspectRatio running...');
        var aspectReal = (var1 / var2);
        var aspectInt = function() {
          //get the aspect ratio by getting the gcd (greatest common denominator) and dividing W and H by it
          //This is a single line function that wraps over two lines 
          function gcd(var1,var2) {if ( var2 > var1 ) { 
            // !VA Added variable declaration
            var temp = var1; 
            var1 = var2; 
            var2 = temp; } while(var2!= 0) { 
            // !VA Added variable declaration
            var m = var1%var2; 
            var1 = var2;
            var2 = m; } 
          return var1;}
          var gcdVal = gcd( var1 , var2 );
          //divide the W and H by the gcd
          var w = (var1 / gcdVal);
          var h = (var2 / gcdVal);
          //Express and return the aspect ratio as an integer pair
          aspectInt = (w + ' : ' + h);
          return aspectInt;
        }();
        return [aspectReal, aspectInt];  
      },

      getFilenameFromSource: function (source) {
        // console.log('getFilenameFromSource running...');
        if (source) {
          // console.log('there is a source');
          var path = source.split('/');
          return  path[path.length - 1];
        } else {
          
          console.log('getFilenameFromSource: there is no source');
          // return `<span class='pop-font'>&nbsp;&nbsp;No Image</span>`;
        }
      },

      evalViewerSize: function (Appdata) {
        // !VA This isn't necessary here, but will probably be used somewhere else...
        // const maxViewerWidth = (parseInt(window.getComputedStyle(appRegions.appContainer,null).getPropertyValue('width'), 10)) - 48;

        // Using the current image dimensions, set the size of the viewer based on the following criteria:
        // !VA This can probably be recoded for efficiency but it works for now 
        switch(true) {
        // The image falls within the default viewer dimensions set in initApp, so do nothing.
        // !VA This case is irrelevant since we're now comparing everything to maxViewerWidth not the  init values. Change accordingly...
        // !VA  NOT SO...now we're trying to restore the previous functionality so...
        case (Appdata.imgNW <= Appdata.viewerW) && (Appdata.imgNH < Appdata.viewerH) :
          Appdata.imgW = Appdata.imgNW;
          Appdata.imgH = Appdata.imgNH;
          // !VA viewerH is set in initApp, so no change to it here
          // !VA viewerH is set in initapp, so no change to that here either.
          // !VA We don't need to adjust height...but maybe we do for consistency's sake
          this.adjustContainerHeights(Appdata);
          console.log('CASE 1');
          // !VA This looks good...
          break;

        // The image is wider than the current viewer width but shorter than current viewer height, so resize the image based on the viewer width
        case (Appdata.imgNW > Appdata.viewerW) && (Appdata.imgNH < Appdata.viewerH) :
          // console.log('CASE 2');
          // Set the image width to the current viewer
          Appdata.imgW = Appdata.viewerW;
          // Get the image height from the aspect ration function
          Appdata.imgH = Math.round((1/this.getAspectRatio(Appdata.imgNW, Appdata.imgNH)[0]) * Appdata.imgW);
          // Set the viewerH to the imgH
          Appdata.viewerH = Appdata.imgH;
          this.adjustContainerHeights(Appdata);
          console.log('CASE 2');
          // !VA Looks good...
          break;

        // The image is not as wide as the current viewer width, but is taller than the viewer height. Keep the image width but resize the viewer in order to display the full image height
        // !VA This might be a problem with consecutive images without page refresh
        case (Appdata.imgNW <= Appdata.viewerW) && (Appdata.imgNH > Appdata.viewerH) :
          // console.log('CASE 3');
          // Set the viewer height and the image height to the image natural height
          Appdata.viewerH = Appdata.imgH = Appdata.imgNH;
          // Set the image width to the natural image width
          Appdata.imgW = Appdata.imgNW;
          console.log('Appdata.viewerH is: ' + Appdata.viewerH);

          // !VA  Use adjustContainerHeights to get the Appdata height
          // !VA  Note the dependency with initAppdata, see 'Dependency with adjustContainerHeights'
          this.adjustContainerHeights(Appdata);
          console.log('CASE 3');
          // !VA 
          break;

        // The image is wider and taller than the current viewer height and width so we have to resize the image and the viewport based on the current viewport width
        case (Appdata.imgNW > Appdata.viewerW) && (Appdata.imgNH > Appdata.viewerH) :
          // console.log('CASE 4');
          // Set the image Width to the current  viewer width 
          console.log('Case 4: Appdata.viewerW is: ' + Appdata.viewerW );
          Appdata.imgW = Appdata.viewerW;
          // Set the image height proportional to the new image width using the aspect ratio function
          Appdata.imgH = Math.round((1/this.getAspectRatio(Appdata.imgNW, Appdata.imgNH)[0]) * Appdata.imgW);
          // Set the viewer height to the image height
          Appdata.viewerH = Appdata.imgH;

          // Get the viewport and Appdata height from adjustContainerHeights
          this.adjustContainerHeights(Appdata);
          console.log('CASE 4');
          // !VA  BUG Problem with the 800X550, 800X600 -- no top/bottom gutter on viewport
          break;
        }

      },

      
      adjustContainerHeights: function (Appdata)  {
        // !VA This calculates the imgViewer, imgViewport and appContainer height based on the 
        // console.dir(Appdata);
        var heightVal = Appdata.imgH;
        // console.log('heightVal is: ' + heightVal);
        // console.log('adjustContainerHeights Appdata is: ');
        // console.dir(Appdata);
        let viewerH;
        let viewportH;
        let appContainerH; 
    
        // !VA These values still seem arbitrary, need to review. There's a dependency in initAppObj, see 'Dependency with adjustContainerHeights'
        // !VA I'm not even sure this is necessary since we're getting the viewerW from maxViewerHeight now -- but we'll leave it in here for the time being.
        if (heightVal <= Appdata.initViewerH) {
          // !VA  This is the min-height set in CSS
          // appObj.appContainerH = 804;
          // !VA Trying to set the viewerH based on the initViewerH...
          viewerH = Appdata.initViewerH;
          viewportH = viewerH + 145;
        } else {
          // Need a little buffer in the viewport
          viewerH = heightVal;
          viewportH = heightVal + 145;
        }
    
    
        // viewportH = heightVal + 125;
        appContainerH = viewportH;
        // console.log('Appdata is...');
        // console.dir(Appdata);
        // This should write the heights to Appdata and then pass it to the function that writes Appdata to the dimViewers, probably called refreshDimViewers. In fact, there's no reason not to consolidate that function with the function that updates the image container heights and refresh the entire UI at the same time, so refreshUI.
        // console.log('AppcontainerH is: ' + appContainerH);
        Appdata.viewerH = viewerH;
        console.log('Appdata.viewerH is now: ' + Appdata.viewerH);
        Appdata.viewportH = viewportH;
        Appdata.appH = appContainerH;
        // console.log('adjustContainerHeights: Appdata is...');
        // console.dir(Appdata);
        UIController.refreshAppUI(Appdata);
      }

    };

  })();



  // !VA GLOBAL APP CONTROLLER
  var controller = (function(calcCtrl, UICtrl) {

    var Appobj = {};

    // !VA V2 getting ID strings from UIController
    var dimViewers = UIController.getDimViewerIDs();
    var dynamicRegions = UIController.getDynamicRegionIDs();
    var staticRegions = UIController.getStaticRegionIDs();
    var toolButtons = UIController.getToolButtonIDs();
    var ccpPropStrings = UIController.getCcpPropStringsIDs();
    var ccpUserInput = UIController.getDynamicRegionIDs();
    var ccpBuildTag = UIController.getCcpBuildTagIDs();
    var dynamicRegions = UIController.getDynamicRegionIDs();
    // var Appdata = UIController.getAppdata();




    var setupEventListeners = function() {

      //DRAG AND DROP PROCESSING START
      //Drag and Drop Handler 
      function handleDragOver(evt) {
        //prevent the bubbling of the event to the parent event handler
        evt.stopPropagation();
        //prevent the default action of the element from executing -- so in this case
        //I think since it is a div the default event would be for some browsers to 
        //open the file in the browser when dropped
        evt.preventDefault();
        //console.log('dragging over');
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        console.log('Calling HandleFileSelect');
      }

      // Event Listeners for Drag and Drop
      // !VA dropZone is the screen region that will accept the drop event 
      var dropZone = document.querySelector(dynamicRegions.appContainer);
      dropZone.addEventListener('dragover', handleDragOver, false);
    
      // !VA Initiates the FileReader function to get the dropped image data
      dropZone.addEventListener('drop', UIController.handleFileSelect, false);
      // dropZone.addEventListener('drop', startNewDrop, false);
      // Drag and Drop Listener 
      //DRAG AND DROP PROCESSING END

      //EVENT HANDLING START 
      function addEventHandler(oNode, evt, oFunc, bCaptures) {
        //Removing this -- apparently IE 9 and 10 support addEventListener
        // if (typeof(window.event) != "undefined")
        // 	oNode.attachEvent("on"+evt, oFunc);
        // else
        oNode.addEventListener(evt, oFunc, bCaptures);
      }

      function initializeHandlers() {
        //Dim Viewer Clipboard Controls
        // addEventHandler(dimViewers.clipboardBut,'click',toggleCCP,false);
        // addEventHandler(dimViewers.clipboardBut,'keypress',toggleCCP,false);
        // CCP button show and hide
        // !VA NOW -- these should be addEventHandler calls -- but it works for now.
        // ccpUserInput.imgClass.addEventListener('keypress', showMobileImageButtons);
        // ccpUserInput.imgClass.addEventListener('blur', showMobileImageButtons);
        // !VA NOW -- changed the above two to addEventHandler calls -- seems fine.
        // addEventHandler(ccpUserInput.imgClass,'keypress',showMobileImageButtons,false);
        // addEventHandler(ccpUserInput.imgClass,'blur',showMobileImageButtons,false);
        // !VA alt and path fields should not show the CSS buttons
        // ccpUserInput.imgAlt.addEventListener('keypress', showMobileImageButtons);
        // ccpUserInput.imgAlt.addEventListener('blur', showMobileImageButtons);
        // ccpUserInput.imgRelPath.addEventListener('keypress', showMobileImageButtons);
        // ccpUserInput.imgRelPath.addEventListener('blur', showMobileImageButtons);

        //Image Dimensioning Controls
        // addEventHandler(toolButtons.grow01,'click',refreshAppObj,false);
        // addEventHandler(toolButtons.shrink01,'click',refreshAppObj,false);
        // addEventHandler(toolButtons.grow10,'click',refreshAppObj,false);
        // addEventHandler(toolButtons.shrink10,'click',refreshAppObj,false);
        // addEventHandler(toolButtons.grow50,'click',refreshAppObj,false);
        // addEventHandler(toolButtons.shrink50,'click',refreshAppObj,false);
        // addEventHandler(toolButtons.customWidth,'dragover',killDrop,false);
        // addEventHandler(toolButtons.customWidth,'drop',killDrop,false);
        // addEventHandler(toolButtons.customHeight,'dragover',killDrop,false);
        // addEventHandler(toolButtons.customHeight,'drop',killDrop,false);
        // addEventHandler(toolButtons.viewerWidth,'dragover',killDrop,false);
        // addEventHandler(toolButtons.viewerWidth,'drop',killDrop,false);
        // addEventHandler(toolButtons.viewerWidth,'keypress',refreshAppObj,false);
        // addEventHandler(toolButtons.viewerWidth,'click',focusOnClick,false);
        // !VA 
        // addEventHandler(toolButtons.customWidth,'click',focusOnClick,false);
        // addEventHandler(toolButtons.customWidth,'keypress',refreshAppObj,false);
        // addEventHandler(toolButtons.customHeight,'click',focusOnClick,false);
        // addEventHandler(toolButtons.customHeight,'keypress',refreshAppObj,false);
        // addEventHandler(toolButtons.viewerWidth,'blur',handleInputBlur,false);
        // addEventHandler(toolButtons.customWidth,'blur',handleInputBlur,false);
        // addEventHandler(toolButtons.customHeight,'blur',handleInputBlur,false);
        // !VA 
        // addEventHandler(toolButtons.sPhoneWidth,'dragover',killDrop,false);
        // addEventHandler(toolButtons.sPhoneWidth,'drop',killDrop,false);
        // addEventHandler(toolButtons.sPhoneWidth,'keypress',refreshAppObj,false);
        // addEventHandler(toolButtons.sPhoneWidth,'blur',handleInputBlur,false);
        // addEventHandler(toolButtons.sPhoneWidth,'click',focusOnClick,false);
        // addEventHandler(toolButtons.lPhoneWidth,'dragover',killDrop,false);
        // addEventHandler(toolButtons.lPhoneWidth,'drop',killDrop,false);
        // addEventHandler(toolButtons.lPhoneWidth,'keypress',refreshAppObj,false);
        // addEventHandler(toolButtons.lPhoneWidth,'blur',handleInputBlur,false);
        // addEventHandler(toolButtons.lPhoneWidth,'click',focusOnClick,false);

        // addEventHandler(ccpUserInput.tableWidth,'change',handleOnChange,false);
        // addEventHandler(ccpUserInput.imgWidth,'change',handleOnChange,false);



      }
      addEventHandler(window, 'load', function(evt) {initializeHandlers(); } );


    };

    var initializeDevMode = function() {
      console.log('initializeDevMode running...');
      // !VA Get the imgViewer dimensions as set in CSS:
      var initViewerW = parseInt(document.querySelector(dynamicRegions.imgViewer).style.width);
      var initViewerH = parseInt(document.querySelector(dynamicRegions.imgViewer).style.height);
      // !VA Initalize the imgViewer width input field value to the default of 650
      document.querySelector(toolButtons.viewerWidth).placeholder = initViewerW;
      // console.log('toolButtons.viewerWidth is: ' + toolButtons.viewerWidth);
      // !VA  Test if there is currently #main-img element with an image.If there is, it's hardcoded in the HTML and we're in DEV MODE. If there's not, the app is being initialized in USER MODE.
      var curImgExists = document.querySelector(dynamicRegions.curImg);
      console.log('curImgExists is: ' + curImgExists);
      // !VA  Now we have to populate Appdata with data. We can do it manually here and just pass the object on to refresh the screen elements.



      // !VA If there's no current image, then return false. This is the flag to the initializeDOM function that there is no DEV image in the HTML. The init then shows the drop area and 'No Image' in the dimViewers.

      // !VA  There is a current image, so first populate Appdata manually and then populate getAppData based on the object properties in Appdata
      var AppobjDev = {
        currentimg: document.querySelector(dynamicRegions.curImg),
        viewer: document.querySelector(dynamicRegions.imgViewer),
        viewport: document.querySelector(dynamicRegions.imgViewport),
        appcontainer: document.querySelector(dynamicRegions.appContainer)
      }; 
      console.log('AppobjDev is...');
      console.dir(AppobjDev);
      console.log('AppobjDev.viewport.style.width is: ' + AppobjDev.viewport.style.width);

      var filename = calcController.getFilenameFromSource(AppobjDev.currentimg.src);

      // !VA Hide the drop area.
      document.querySelector(staticRegions.dropArea).style.display = 'none';
      // !VA  Show the toolbar
      document.querySelector(staticRegions.toolsContainer).style.display = 'block';

      // !VA AppobjDev returns NaN for the viewer containers because they don't have values yet... not sure I understand why since height and width are initially declared in CSS.
      var Appdata = UIController.getAppData(AppobjDev, filename);
      // !VA evaluate the viewer containers and adjust their size based on the returned Appdata
      var evalViewerSize = calcController.evalViewerSize(Appdata);


      

    };



    return {
      init: function(){
        console.log('App initialized.');
        // !VA  Initialize the ImgViewer to accomodate the dragArea. This should be the same as the CSS definition.
        document.querySelector(dynamicRegions.imgViewer).style.width = '650px';
        document.querySelector(dynamicRegions.imgViewer).style.height = '450px';

        setupEventListeners();
        // !VA  Test if there is currently #main-img element with an image.If there is, it's hardcoded in the HTML and we're in DEV MODE. If there's not, the app is being initialized in USER MODE.
        var curImgExists = document.querySelector(dynamicRegions.curImg);
        if (curImgExists) {
          initializeDevMode();
        } else {

          UIController.refreshAppUI(Appobj);
          /* !VA  
          1) Set the initial interface:
          
          */
          // initializeUserMode();
          /*
        // !VA This is USER MODE -- there's no hardcoded image in the HTML file.
        // !VA  Initialize Appdata to provide values for the Appdata function. Use the  
        console.log('USER MODE: no current image');
        // !VA V2 Show the dropArea
        document.querySelector(staticRegions.dropArea).style.display = 'block';
        // !VA Give some w and h to the imgViewer to show the white icon background.
        document.querySelector(dynamicRegions.imgViewer).style.width = '650px';
        document.querySelector(dynamicRegions.imgViewer).style.height = '450px';
        // !VA  Now we create an Appdata using the dropArea instead of a curImg, since we don't have a curImg yet. The dropArea will be replaced with a curImg as soon as the user drops one in.
        curImg = document.querySelector('#drop-area');
        imgViewer = document.querySelector(dynamicRegions.imgViewer);
        imgViewport = document.querySelector(dynamicRegions.imgViewport);
        appContainer = document.querySelector(dynamicRegions.appContainer);
        // !VA Update the and return the Appdata with the current values
       var Appdata = UIController.updateAppdata(curImg, imgViewer, imgViewport, appContainer);
        console.dir(Appdata);
        // !VA Now get the Appdata using the current Appdata
        var Appdata = UIController.getAppData(Appdata);
        // console.dir(Appdata);
        console.log('Appdata.currentimg is: ' + Appdata.currentimg);
        console.log(Appdata.filename());

        // !VA  !IMPORTANT! To loop through an object listing, use Object.key, .value and .entries to convert a list object into an array!!!!!!!
        // !VA  Loop throug the array and assign No Image tot he dimViewers
        const dimarray = Object.values(dimViewers);
        for ( let i = 0; i < dimarray.length; i++ ) {
          if ( dimarray[i] !== '#clipboard-but' &&  dimarray[i] !== '#filename-viewer' ) {
            document.querySelector(dimarray[i]).innerHTML = `<span class='pop-font'>&nbsp;&nbsp;No Image</span>`;
          } 
        } 
              */
        }
      }
    };

  })(calcController, UIController);

  controller.init();

//Namespace closure
})();