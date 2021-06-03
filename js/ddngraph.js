(function(){
  document.addEventListener('DOMContentLoaded', function(){
    // title change
    document.getElementById("title").innerText = "";

    const urlParams = new URLSearchParams(window.location.search);
    let DDNfile = urlParams.get('DDN')
    if (DDNfile != null) {
      document.getElementById("title").innerText = DDNfile.replaceAll("_", " ");
      document.getElementById("title2").innerText = DDNfile.replaceAll("_", " ");

      // document.getElementById("DDN").innerText = DDNfile;
      DDNfile = DDNfile + '.json'
    } else {
      document.getElementById("DDN").innerText = "Specify DDN json file in URL, like ?DDN=g-beta";
    }

    const defaultStyleSheet = "ddn-style.json"


    var $$ = selector => Array.from( document.querySelectorAll( selector ) );
    var $ = selector => document.querySelector( selector );

    let tryPromise = fn => Promise.resolve().then( fn );

    let toJson = obj => obj.json();
    let toText = obj => obj.text();

    var cy;

    let hrefString = (name, url) => {
      return "<a target=\"_blank\" href=\"" + url + "\">" + name + "</a>"
    }

    let $stylesheet = $('#style');
    let getStylesheet = name => {
      let convert = res => name.match(/[.]json$/) ? toJson(res) : toText(res);

      return fetch(`stylesheets/${name}`).then( convert );
    };

    let applyStylesheet = stylesheet => {
      if( typeof stylesheet === typeof '' ){
        cy.style().fromString( stylesheet ).update();
      } else {
        cy.style().fromJson( stylesheet ).update();
      }
    };
    // let applyStylesheetFromSelect = () => Promise.resolve( $stylesheet.value ).then( getStylesheet ).then( applyStylesheet );
    let applyStylesheetFromSelect = () => Promise.resolve( defaultStyleSheet ).then( getStylesheet ).then( applyStylesheet );

    let $dataset = $('#data');
    let getDataset = name => fetch(`datasets/${name}`).then( toJson );
    let applyDataset = dataset => {
      // so new eles are offscreen
      cy.zoom(0.001);
      cy.pan({ x: -9999999, y: -9999999 });

      // replace eles
      cy.elements().remove();
      cy.add( dataset );

      let nodes = cy.nodes();
      layouts.cola.boundingBox.x2 = Math.round(Math.sqrt(nodes.length))*layouts.cola.nodeSpacing*5;
      layouts.cola.boundingBox.y2 = layouts.cola.boundingBox.x2;

      layouts.cose.boundingBox.x2 = Math.round(Math.sqrt(nodes.length))*layouts.cola.nodeSpacing*10;
      layouts.cose.boundingBox.y2 = layouts.cose.boundingBox.x2;

      // let eles = cy.edges();

/*       var $links = [
        {
          name: 'GeneCard',
          url: 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + "TP53"
        }
      ].map(function( link ){
        return htmlElement('a', { target: '_blank', href: link.url, 'class': 'tip-link' }, [ htmlTextNode(link.name) ]);
      });

      document.getElementById("M1").appendChild($links)
 */
      let geneCardURL = "http://www.genecards.org/cgi-bin/carddisp.pl?gene="

      var sp_mediators = []
      nodes.forEach(function(n) {
        if (n.data('mediator') == "Specificity mediator" | n.data('mediator') == "Dual mediator") {
          sp_mediators.push(hrefString(n.data('name'), geneCardURL + n.data('name')))
        }
      })
      if (sp_mediators.length > 0) {
        sp_mediators.sort()
      }      

      var ess_mediators = []
      nodes.forEach(function(n) {
        if (n.data('mediator') == "Essentiality mediator" | n.data('mediator') == "Dual mediator") {
          ess_mediators.push(hrefString(n.data('name'), geneCardURL + n.data('name')))
        }
      })
      if (ess_mediators.length > 0) {
        ess_mediators.sort()
      }

      // let metadata = cy.metadata();
      document.getElementById("specificity_mediators").innerHTML = sp_mediators.join(", ")
      document.getElementById("essentiality_mediators").innerHTML = ess_mediators.join(", ")

      document.getElementById("C1_name").innerText = "(".concat(dataset.metadata[0].data.C1).concat(")")
      document.getElementById("C2_name").innerText = "(".concat(dataset.metadata[0].data.C2).concat(")")
      
      setTippies();
    }

    let applyDatasetFromSelect = () => Promise.resolve( DDNfile ).then( getDataset ).then( applyDataset )
    let calculateCachedCentrality = () => {
      let nodes = cy.nodes();

      if (nodes.length > 0 && nodes[0].data('centrality') == null) {
        let centrality = cy.elements().closenessCentralityNormalized();

        nodes.forEach( n => n.data( 'centrality', centrality.closeness(n) ) );
      }
    };

    let $ddnedges = $('#ddnEdges');
    let activateEdges = edgeType => {
      cy.style()
        .selector('edge')
        .style({
          "visibility": "visible"
        })
        .update();

      hideSharedEdges()
      hideNodeNames()
      hideGroups()

      if (edgeType == "C1") {
        cy.style()
          .selector('edge[condition = "C2"]')
          .style({
            "visibility": "hidden"
          })
          .update();
      } else if(edgeType == "C2") {
        cy.style()
          .selector('edge[condition = "C1"]')
          .style({
            "visibility": "hidden"
          })
          .update();      
      }
    }
    let activateEdgesFromSelect = () => Promise.resolve( $ddnedges.value ).then( activateEdges );

    let $hideSharedEdgesCheckbox = $('#hideSharedEdges');
    let hideSharedEdges = () => {
      if (document.getElementById('hideSharedEdges').checked) 
      {
        cy.style()
          .selector('edge[condition = "Both"]')
          .style({
            "visibility": "hidden"
          })
          .update();
      } else {
        cy.style()
          .selector('edge[condition = "Both"]')
          .style({
            "visibility": "visible"
          })
          .update();
      }
    }

    let $hideNodeNamesCheckbox = $('#hideNodeNames');
    let hideNodeNames = () => {
      if (document.getElementById('hideNodeNames').checked) 
      {
        cy.style()
          .selector('node[mediator = ""]')
          .style({
            "content": ""
          })
          .update();
      } else {
        cy.style()
          .selector('node[mediator = ""]')
          .style({
            "content": "data(name)"
          })
          .update();
      }
    }

    let $hideGroupsCheckbox = $('#hideGroups');
    let hideGroups = () => {
      if (document.getElementById('hideGroups').checked) 
      {
        cy.style()
          .selector(':parent')
          .style({
            "label": "",
          })
          .update();
      } else {
        cy.style()
          .selector(':parent')
          .style({
            "label": "data(id)",
          })
        .update();
      }
    }
    let $layout = $('#layout');
    let maxLayoutDuration = 2500;
    let layoutPadding = 50;
    let concentric = function( node ){
      calculateCachedCentrality();

      return node.data('centrality');
    };
    let levelWidth = function( nodes ){
      calculateCachedCentrality();

      let min = nodes.min( n => n.data('centrality') ).value;
      let max = nodes.max( n => n.data('centrality') ).value;


      return ( max - min ) / 5;
    };

    let layouts = {
      cola: {
        name: 'cola',
        padding: layoutPadding,
        nodeSpacing: 12,
        edgeLengthVal: 45,
        animate: true,
        randomize: true,
        maxSimulationTime: maxLayoutDuration,
        boundingBox: { // to give cola more space to resolve initial overlaps
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100
        },
        edgeLength: function( e ){
          let w = e.data('weight');

          if( w == null ){
            w = 0.5;
          }

          return 45 / w;
        }
      },
      cose: {
        name: 'cose',
        padding: layoutPadding,
        nodeSpacing: 12,
        edgeLengthVal: 45,
        animate: true,
        randomize: true,
        maxSimulationTime: maxLayoutDuration,
        boundingBox: { // to give cola more space to resolve initial overlaps
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100
        }      
      },
      concentricCentrality: {
        name: 'concentric',
        padding: layoutPadding,
        animate: true,
        animationDuration: maxLayoutDuration,
        concentric: concentric,
        levelWidth: levelWidth
      },
      concentricHierarchyCentrality: {
        name: 'concentric',
        padding: layoutPadding,
        animate: true,
        animationDuration: maxLayoutDuration,
        concentric: concentric,
        levelWidth: levelWidth,
        sweep: Math.PI * 2 / 3,
        clockwise: true,
        startAngle: Math.PI * 1 / 6
      },
      custom: { // replace with your own layout parameters
        name: 'preset',
        padding: layoutPadding
      }
    };
    let prevLayout;
    let getLayout = name => Promise.resolve( layouts[ name ] );
    let applyLayout = layout => {
      if( prevLayout ){
        prevLayout.stop();
      }

      let l = prevLayout = cy.makeLayout( layout );

      return l.run().promiseOn('layoutstop');
    }
    let applyLayoutFromSelect = () => Promise.resolve( $layout.value ).then( getLayout ).then( applyLayout );


    let $PNGbutton = $('#png');
    let exportPNG = () => {
      var myPNG = cy.png({'output': 'blob', bg:"#ffffff" });

      var name = document.getElementById("title").innerText 
      var type = "image/png";
      var a = document.createElement('a');
      var file = new Blob([myPNG], { type: type });
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
      a.remove()
    }


    cy = window.cy = cytoscape({
//      container: $('#cy')
      container: document.getElementById('cy'),
    });


    tryPromise( applyDatasetFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );

    //$dataset.addEventListener('change', function(){
      // tryPromise( applyDatasetFromSelect ).then( applyLayoutFromSelect ).then ( applyAlgorithmFromSelect );
    //});


    //
    // utility functions
    //
    var htmlElement = function(tag, attrs, children){
      var el = document.createElement(tag);

      Object.keys(attrs).forEach(function(key){
        var val = attrs[key];

        el.setAttribute(key, val);
      });

      children.forEach(function(child){
        el.appendChild(child);
      });

      return el;
    };

    var htmlTextNode = function(text){
      var el = document.createTextNode(text);

      return el;
    };

    var makeTippy = function(ele, html){
      return tippy( ele.popperRef(), {
        html: html,
        trigger: 'manual',
        arrow: true,
        placement: ele.isNode() ? 'bottom':'top',
        hideOnClick: false,
        sticky: true,
        interactive: true
      } ).tooltips[0];
    };

    var hideTippy = function(node){
      var tippy = node.data('tippy');

      if(tippy != null){
        tippy.hide();
      }
    };

    var hideAllTippies = function(){
      cy.nodes().forEach(hideTippy);
      cy.edges().forEach(hideTippy);
    };

    var setTippies = function() {
      cy.on('tap', function(e){
        if(e.target === cy){
          hideAllTippies();
        }
      });

      // cy.on('tap', 'edge', function(e){
      //   hideAllTippies();
      // });

      cy.on('zoom pan', function(e){
        hideAllTippies();
      });

      cy.edges().forEach(function (n) {
        var priorinfo = n.data('priorinfo');

        var tippy = makeTippy(n, htmlElement('div', {}, [htmlTextNode(priorinfo)]))

        n.data('tippy', tippy);

        n.on('click', function(e){
          tippy.show();

          cy.edges().not(n).forEach(hideTippy);
          cy.nodes().forEach(hideTippy);
        });
      });


      cy.nodes().forEach(function(n){
        var g = n.data('name');

        if (g == null) {
          return ""
        }
        var $links = [
          {
            name: 'GeneCard',
            url: 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + g
          }
        ].map(function( link ){
          return htmlElement('a', { target: '_blank', href: link.url, 'class': 'tip-link' }, [ htmlTextNode(link.name) ]);
        });

        var tippy = makeTippy(n, htmlElement('div', {}, $links));

        n.data('tippy', tippy);

        n.on('click', function(e){
          tippy.show();

          cy.nodes().not(n).forEach(hideTippy);
          cy.edges().forEach(hideTippy);
        });
      });
    }

    //$stylesheet.addEventListener('change', applyStylesheetFromSelect);

    $ddnedges.addEventListener('change', activateEdgesFromSelect);
    $('#redo-ddn').addEventListener('click', activateEdgesFromSelect);

    $layout.addEventListener('change', applyLayoutFromSelect);
    $('#redo-layout').addEventListener('click', applyLayoutFromSelect);

    $hideSharedEdgesCheckbox.addEventListener('click', hideSharedEdges);
    $hideNodeNamesCheckbox.addEventListener('click', hideNodeNames);
    $hideGroupsCheckbox.addEventListener('click', hideGroups);

    $PNGbutton.addEventListener('click', exportPNG);
  });
})();

// tooltips with jQuery
// ß$(document).ready(() => $('.tooltip').tooltipster());