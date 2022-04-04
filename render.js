const { ipcRenderer } = require('electron')
var $ = require('jQuery');
ipcRenderer.on("preencher-ipext", (event, ipexterno) => {
    document.getElementById("ipexterno").innerText = "IP EXTERNO: "+ipexterno;
});
ipcRenderer.on("preencher-ipint", (event, ipexterno) => {
    document.getElementById("ipinterno").innerText = "IP INTERNO: "+ipexterno;
});
ipcRenderer.on("retornar-erro", (event, erro, fechar) => {
    alert(erro);
    if(fechar === true){
      ipcRenderer.send('close-me')
    }
});
ipcRenderer.on("preencher-portstable", (event, portas) => {
  $('#PortsTable tbody > tr').remove();
  var len = Object.keys(portas).length
  if(len > 0){
    document.getElementById("PortsTable").style.display = "inline-table";
    var jafoi = [];
    for(var i = 0; i < len; i++) {
      if(jafoi.indexOf(portas[i].public.port) === -1){
        jafoi.push(portas[i].public.port);
        var protocolo = portas[i].protocol.toUpperCase();
        for(var j = 0; j < len; j++) {
          if(i !== j && portas[i].public.port === portas[j].public.port){
            protocolo = protocolo.concat('/', portas[j].protocol.toUpperCase());
          }
        }
        $("#PortsTable").find('tbody')
        .append("<tr><td>"+portas[i].public.port+"</td><td>"+protocolo+"</td><td><div class=\"mc-button full\" style=\"width: 95%;margin-left: auto;margin-right: auto;\"><div class=\"title\" onclick=\"fechar_porta("+portas[i].public.port+")\">Fechar Porta</div></div></td></tr>");

      }
    }

  }else{
    document.getElementById("PortsTable").style.display = "none";
  }
});

function fechar_porta(porta){
  if (confirm('Você deseja mesmo fechar a porta '+document.getElementById("input-porta").value+' ?')) {
    ipcRenderer.send('fechar-porta',porta)
  }
}
function abrir_porta(){
  if (confirm('Você deseja mesmo abrir a porta '+document.getElementById("input-porta").value+' ?')) {
    ipcRenderer.send('abrir-porta',document.getElementById("input-porta").value)
    document.getElementById("input-porta").value = "";
  }
}
var fakeCaretInput = '#input-porta',
    fakeCaretInputGhost = '.minecraft-input__caret-container span',
    fakeCaret = '.minecraft-input__caret';


$(function() {
    $("input[id='input-porta").on('input', function(e) {
        $(this).val($(this).val().replace(/[^0-9]/g, ''));
        var max_chars = 5;
        if(document.getElementById("input-porta").value.length > max_chars) {
            document.getElementById("input-porta").value = document.getElementById("input-porta").value.substr(0, max_chars);
        }
    });
});

fakeCaretInit();

function fakeCaretInit() {
  if($(fakeCaretInput).length) {

    // Inject required markup before input
    $('<div class="minecraft-input__caret-container"><span id="minecraft-input__ghost" class="minecraft-input__ghost"></span></div><div class="minecraft-input__caret"></div>').insertBefore($(fakeCaretInput));

    // Be sure the fake caret is in the right starting position
    var fakeInputOffset = $(fakeCaretInput).offset(),
        fakeCaretInputGhostOffset = $(fakeCaretInputGhost).offset(),
        fakeCaretOffset = (fakeCaretInputGhostOffset.left - fakeInputOffset.left);
    //$(fakeCaret).css('margin-left',fakeCaretOffset);

    // Copy styles from input to ghost input
    // var receiver = document.querySelector('.search-input__caret-container');
    // var styles   = getComputedStyle(fakeCaretInput);
    // var cssText = '';
    // for(var style in styles){
    //     cssText += style+':'+styles[style];
    // }
    // receiver.style.cssText = cssText;

    function setCaretXY(elem, real_element, caret) {
      var rects = document.getElementById("minecraft-input__ghost").getClientRects();
      var lastRect = rects[rects.length - 1];
      var realElementOffset = $(real_element).offset();

      var x = lastRect.left + lastRect.width - realElementOffset.left + document.body.scrollLeft;
      // y = lastRect.top - real_element.scrollTop - offset[1] + document.body.scrollTop;
      $(caret).css('left',x );
    }

    function moveCaret() {
      $(fakeCaretInputGhost).text($(fakeCaretInput).val().substring(0, $(fakeCaretInput)[0].selectionStart).replace(/\n$/, '\n\u0001'));
      setCaretXY(fakeCaretInputGhost, fakeCaretInput, fakeCaret);
    }

    $(fakeCaretInput).on("input keydown keyup propertychange click paste cut copy mousedown mouseup change", function () {
      moveCaret();
    });

  } else {

  }

}
