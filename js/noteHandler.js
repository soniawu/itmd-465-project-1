
(function($) {
  $(document).ready(
    function() {
      var db;
      const DB_NAME = 'itmd-465-project-1-notes';
      const DB_VERSION = 1; 
      const DB_STORE_NAME = 'notes';

      function openDB(){
        var openRequest = indexedDB.open(DB_NAME,DB_VERSION);
        // indexedBD on upgrade 
        openRequest.onupgradeneeded = function(e) {
          var thisDB = e.target.result;
          // read more, may need to condition to create onl if not exist
          var store = thisDB.createObjectStore(DB_STORE_NAME, { keyPath: 'id', autoIncrement : true });
          store.createIndex('author', 'author', { unique: false });
          store.createIndex('subject', 'subject', { unique: false });
          store.createIndex('timeStamp', 'timeStamp', { unique: false });
          store.createIndex('message', 'message', { unique: false });
          
        }
        
        /* indexedDB open successfullu */
        openRequest.onsuccess = function(e) {
          db = e.target.result;
          /* load list here, consider a function */
          displayNoteList();
        } /* openRequest.onsuccess */
        
        /* Fail to open indexedDB */
        openRequest.onerror = function(e) {
          console.log("Open Error!");
          console.dir(e);
        } /* openRequest.onerror */
      } // openDB
      
      //-------------------------------------
      /****************************************
      * function: showNoteForm()
      * This function is to handle the note form input.
      * There are 3 cases when this function is called,
      * 1) When "Add a Note" button is cliaked
      * 2) When a spesific note link (on subject field) is clicked
      * 3) After 2) above, "Update Note" button is clicked.
      *****************************************/
      function showNoteForm(reqType,id) {
        // reqType = 0 add new note, id can be ignored.
        // reqType = 1 update the note, load data to field value.
        // reqType = 2 display note only, load data, disable input.
        
        $('#note-form').removeClass('hide');
        
        // This block is for adding new a note, need "Save Note" button
        if (reqType === 0) {
          $('#sav-btn').removeClass('hide');
          $('#upd-btn').addClass('hide');
          $('#del-btn').addClass('hide');
          
          $('#form-heading').html('Enter note entries, click "Save Note" button to save note');
          $('#key').removeAttr('value');
          $('#author').removeAttr('value');
          $('#subject').removeAttr('value');
          $('#message').removeAttr('value');
          $('#author,#subject,#message').prop('disabled',false);
        }
        
        // This block is to show details of the note.
        // Then, user will select update the note or delete the note.
        // At this point "Update Note" and "Delete Note" buttons are needed
        // Form fields are in display only mode.
        if (reqType === 1) {
            $('#upd-btn').addClass('hide');
            $('#del-btn').addClass('hide');
            $('#sav-btn').removeClass('hide');
            $('#form-heading').html('Enter note entries, click "Save Note" button to save  the note');
            $('#author,#subject,#message').prop('disabled',false);
        
        }
        
        // This block is for updating a note. "Save Note" button is needed.
        if (reqType === 2) {
          var store = getObjectStore(DB_STORE_NAME, 'readwrite');
          var req = store.get(id);
          
          req.onerror = function() {
            console.log('Failed to get the note');
            return false;
          }
          
          req.onsuccess = function(e) {
            var athr = req.result.author;
            var sub = req.result.subject;
            var msg = req.result.message;

            $('#form-heading').html('click "Update Note" button to update the note or "Delete Note" to delete the note');
            $('#sav-btn').addClass('hide');
            $('#upd-btn').removeClass('hide');
            $('#del-btn').removeClass('hide');
            $('#note-form')[0].reset();
            $('#key').attr('value',id);
            $('#author').attr('value',athr);
            $('#subject').attr('value',sub);
            $('#message').attr('value',msg);
            $('#author,#subject,#message').attr('disabled','disabled');
          }
        }
      } // showNoteForm() function
      /****************************************
      * function hideNoteForm()
      * This function is to remove the form from display.
      * When user finish editing or delete the note, or "Cancel"
      * button is clicked. This function is called.
      * "hide" class is added to the form. The form will be
      * moved away from screen.
      *****************************************/
      function hideNoteForm() {
        $('#note-form').addClass('hide');
      } // hideNoteForm() function 
      /****************************************
      * function setFormSaveClass()
      * This is to set the note form class for action to be taken 
      * for the note. These classes are "on-new", "on-update" and
      * "on-upd-del". These classes will be later used when saveing 
      * the note, whether to add new note or update an existing one.
      *****************************************/
      function setFormSaveClass(cls) {
        $('#note-form').addClass(cls);
      } // setFormSaveClass() function
      /****************************************
      * function clearFormSaveClass()
      * After editing note is done, this function is called to clear 
      * the class that set by the setFormSaveClass() function above.
      *****************************************/
      function clearFormSaveClass() {
        $('#note-form').removeClass('on-new');
        $('#note-form').removeClass('on-upd');
        $('#note-form').removeClass('on-upd-del');
      } // clearFormSaveClass() function 
      /****************************************
      * function confirmDelete()
      * This is to pop a confirm delete window.
      *****************************************/
      function confirmDelete() {
        var x = confirm("Are you sure to delete the Note?");
        if (x)
          return true;
        else
          return false;
      } // confirmDelete() function
      /****************************************
      * function saveNote()
      * This function is to save a note to indexedBD.
      * It checks the form class to determine if this is
      * a new note or an existing note.
      *****************************************/
      function saveNote() {
        // reqType 0 - new add
        // reqType 1 - update
        
        var curTs = new Date();
        var ts = (curTs.getMonth()+1)+'/'+ curTs.getDate()+'/'+curTs.getFullYear()+'  '+curTs.getHours()+':'+curTs.getMinutes()+':'+curTs.getSeconds();
        console.log(ts);
        var key = $('#key').val();
        var athr = $('#author').val();
        var sub = $('#subject').val();
        var msg = $('#message').val();
        var reqType;
        var store = getObjectStore(DB_STORE_NAME, 'readwrite');
 
        
        if (($('#note-form').hasClass('on-new'))) {
          reqType = 0;
        } else if ($('#note-form').hasClass('on-upd')) {
          reqType = 1;
        } else {
          console.log('Need to know new or update');
          return;
        }
        if (reqType === 0) {
          var req = store.add({
            author: athr,
            subject: sub,
            message: msg,
            timeStamp: ts
          });
          
          req.onerror = function() {
            alert("Add DB error.");
          }
          
          req.onsuccess = function() {
            console.log('Successfully add the note');
          }
        }
        
        if (reqType === 1) {
            var req = store.put({
            id: parseInt(key),
            author: athr,
            subject: sub,
            message: msg,
            timeStamp: ts
          });
          
          req.onerror = function() {
            alert("Add DB error.");
          }
          
          req.onsuccess = function() {
            console.log('Successfully save the note, id - ',key);
          }
        }
      } // saveNote() function
      /****************************************
      * function deleteNote()
      * This function is to delete the note from indexedDB
      *****************************************/
      function deleteNote() {
        var key = $('#key').val();
        var athr = $('#author').val();
        var sub = $('#subject').val();
        var msg = $('#message').val();
        var store = getObjectStore(DB_STORE_NAME, 'readwrite');
        
        console.log(key,athr,sub,msg);
        var req = store.delete(Number(key));
        
        req.onerror = function() {
          console.log('Failed to delete note ');
        }
        
        req.success = function() {
          console.log('Note deleted ');
        }
      } // deleteNote() function
      /****************************************
      * function clearNoteFormFields()
      * This is to clear all the fields in the note form.
      *****************************************/
      function clearNoteFormFields() {
        $('#key').val('');
        $('#author').val('');
        $('#subject').val('');
        $('#message').val('');
      } // clearNoteFormFields() function 
     /****************************************
      * function disableAddBtn()
      * When in editing note mode, disable "Add a Note" button.
      *****************************************/
      function disableAddBtn() {
        $('#add-btn').attr('disabled','disabled');
      } // disableAddBtn()
     /****************************************
      * function enableAddBtn()
      * After note editing is done, enable the "Add a Note" button.
      *****************************************/
      function enableAddBtn() {
        $('#add-btn').prop('disabled',false);
      } // enableAddBtn()
     /****************************************
      * function addEventListeners()
      * This function is to add event listener for all buttons.
      *****************************************/
      function addEventListeners() {
        // To listen to "Add a Note" button clicked
        document.getElementById('add-btn').addEventListener('click', function(){
          setFormSaveClass('on-new');
          clearNoteFormFields();
          disableAddBtn();
          showNoteForm(0,0); 
        }); // add-btn listener
        
        // To listen to "Save Note" button clicked
        document.getElementById('sav-btn').addEventListener('click', function(e){ 
          saveNote();
          hideNoteForm();
          clearFormSaveClass();
          displayNoteList();
          enableAddBtn();
        }); // sav-btn
        
        // To listen to "Update Note" button clicked
        document.getElementById('upd-btn').addEventListener('click', function(e) {
          //e.Defaultprevent();
          clearFormSaveClass();
          setFormSaveClass('on-upd');
          showNoteForm(1,0);
        }); // upd-btn listener
        
        // To listen to "Delete Note" button clicked
        document.getElementById('del-btn').addEventListener('click', function(e) {
          if (confirmDelete()) {
            deleteNote();
            displayNoteList();
            hideNoteForm();
            enableAddBtn();
          }
        }); // del-btn listener
        
        // To listen to "Cancel" button clicked
        document.getElementById('cnl-btn').addEventListener('click', function(e) {
          hideNoteForm();
          enableAddBtn();
        }); // cnl-btn listener 
        
        $('#note-form').on('submit', function(e){e.preventDefault();});
        
      } // addEventListeners() function
     /****************************************
      * function getObjectStore()
      * This is to get the store object.
      *****************************************/
      function getObjectStore(store_name, mode) {
        var tx = db.transaction(store_name, mode);
        return tx.objectStore(store_name);
      } // getObjectStore() function
     /****************************************
      * function displayNoteList()
      * This function is to display the note list on the list table.
      * It also add a link to the subject field. When the link is clicked
      * the selected note detail will be disaplyed.
      *
      * This function is called once at the beginning. Will be called
      * again every time a note action is done, new note added, 
      * existing note updated or deleted.
      *****************************************/
      function displayNoteList(){
        var store = getObjectStore(DB_STORE_NAME, 'readonly');
        var cuntReq = store.count();
        
        cuntReq.onsuccess = function(e){
          var cunt = e.target.result;
          var noteList = document.getElementById('note-list');
          if (noteList.firstChild) {
            noteList.removeChild(noteList.firstChild);
          }

          if ( cunt === 0) {
            //$('h2#list-count-msg').append('There is no note in indexedDB');
            $('h2#list-count-msg').html('There is no note in indexedDB');
          } else {
            // Add table header row
            $('#note-list').append('<table id="note-tbl" border="1" align="center "><tr><th>ID</th><th>Author</th><th>Subject</th><th>Last Modified</th></tr></table>');
            
            // Get all entries from indexed DB
            store.openCursor().onsuccess = function(e) {
              var cursor = e.target.result;
              if (cursor){
                var $link = $('<a href="#" data-key="'+cursor.key+'">'+cursor.value.subject+'</a>');
                /*************************
                * link clicked
                *************************/
                $link.click(function() {
                  // The link can be clicked only when no note is selected at the time
                  if (!($('#note-form').hasClass('hide'))) {
                    return;
                  }
                  setFormSaveClass('on-upd-del');
                  showNoteForm(2,parseInt($(this).attr('data-key')));
                  //$('#add-btn').attr('disabled','disabled');
                  disableAddBtn();
 
                 // var btn = document.getElementById('del-btn');
                  //btn =  document.getElementById('add-btn');
                });
                
                var $row = $('<tr>');
                var $idCell = $('<td>'+cursor.key+'</td>');
                $row.append($idCell);
                var $athrCell = $('<td>'+cursor.value.author+'</td>');
                $row.append($athrCell);
                var $subCell = $('<td></td>').append($link);
                $row.append($subCell);
               // var $msgCell = $('<td>'+cursor.value.message+'</td>')
               // $row.append($msgCell);
                var $tsCell = $('<td>'+cursor.value.timeStamp+'</td>');
                $row.append($tsCell);
                $('#note-list table').append($row);
                cursor.continue();
              } else {  
                $('h2#list-count-msg').html(cunt + ' note(s) in list.');
              }
            } // store.openCursor.onsuccess
          } // cunt !== 0
        } // cuntReq.onsuccess
      } // displayNoteList

      openDB();
      addEventListeners();
    })
  
})(jQuery);