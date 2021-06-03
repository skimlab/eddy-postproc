(function(){
  document.addEventListener('DOMContentLoaded', function(){
    // title change
    document.getElementById("title").innerText = "BABO";

    const urlParams = new URLSearchParams(window.location.search);
    let DDNfile = urlParams.get('DDN')
    if (DDNfile != null) {
      document.getElementById("DDN").innerText = DDNfile;
      DDNfile = DDNfile + '.json'    
    } else {
      document.getElementById("DDN").innerText = "Specify DDN json file...";
    }

    const defaultStyleSheet = "ddn-style.json"


    var $$ = selector => Array.from( document.querySelectorAll( selector ) );
    var $ = selector => document.querySelector( selector );

    let tryPromise = fn => Promise.resolve().then( fn );

    let toJson = obj => obj.json();
    let toText = obj => obj.text();

    var cy;

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

      setTippies();
    }

    let applyDatasetFromSelect = () => Promise.resolve( DDNfile ).then( getDataset ).then( applyDataset )
    let calculateCachedCentrality = () => {
      let nodes = cy.nodes();

      if( nodes.length > 0 && nodes[0].data('centrality') == null ){
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

      if (edgeType == "C1") {
        cy.style()
          .selector('edge[edgeColor = "blue"]')
          .style({
            "visibility": "hidden"
          })
          .update();
      } else if(edgeType == "C2") {
        cy.style()
          .selector('edge[edgeColor = "red"]')
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
          .selector('edge[edgeColor = "grey"]')
          .style({
            "visibility": "hidden"
          })
          .update();
      } else {
        cy.style()
          .selector('edge[edgeColor = "grey"]')
          .style({
            "visibility": "visible"
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
      var text = cy.png({'output': 'blob'});
      var name = "test";
      var type = "image/png";
      var a = document.createElement('a');
      var file = new Blob([text]);
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
      a.remove()
    }

    let $algorithm = $('#algorithm');
    let getAlgorithm = (name) => {
      switch (name) {
        case 'bfs': return Promise.resolve(cy.elements().bfs.bind(cy.elements()));
        case 'dfs': return Promise.resolve(cy.elements().dfs.bind(cy.elements()));
        case 'astar': return Promise.resolve(cy.elements().aStar.bind(cy.elements()));
        case 'none': return Promise.resolve(undefined);
        case 'custom': return Promise.resolve(undefined); // replace with algorithm of choice
        default: return Promise.resolve(undefined);
      }
    };
    let runAlgorithm = (algorithm) => {
      if (algorithm === undefined) {
        return Promise.resolve(undefined);
      } else {
        let options = {
          root: '#' + cy.nodes()[0].id(),
          // astar requires target; goal property is ignored for other algorithms
          goal: '#' + cy.nodes()[Math.round(Math.random() * (cy.nodes().size() - 1))].id()
        };
        return Promise.resolve(algorithm(options));
      }
    }
    let currentAlgorithm;
    let animateAlgorithm = (algResults) => {
      // clear old algorithm results
      cy.$().removeClass('highlighted start end');
      currentAlgorithm = algResults;
      if (algResults === undefined || algResults.path === undefined) {
        return Promise.resolve();
      }
      else {
        let i = 0;
        // for astar, highlight first and final before showing path
        if (algResults.distance) {
          // Among DFS, BFS, A*, only A* will have the distance property defined
          algResults.path.first().addClass('highlighted start');
          algResults.path.last().addClass('highlighted end');
          // i is not advanced to 1, so start node is effectively highlighted twice.
          // this is intentional; creates a short pause between highlighting ends and highlighting the path
        }
        return new Promise(resolve => {
          let highlightNext = () => {
            if (currentAlgorithm === algResults && i < algResults.path.length) {
              algResults.path[i].addClass('highlighted');
              i++;
              setTimeout(highlightNext, 500);
            } else {
              // resolve when finished or when a new algorithm has started visualization
              resolve();
            }
          }
          highlightNext();
        });
      }
    };
    let applyAlgorithmFromSelect = () => Promise.resolve( $algorithm.value ).then( getAlgorithm ).then( runAlgorithm ).then( animateAlgorithm );

    cy = window.cy = cytoscape({
//      container: $('#cy')
      container: document.getElementById('cy'),
    });


    tryPromise( applyDatasetFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );

    //$dataset.addEventListener('change', function(){
      tryPromise( applyDatasetFromSelect ).then( applyLayoutFromSelect ).then ( applyAlgorithmFromSelect );
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

    // $PNGbutton.addEventListener('click', exportPNG);

    $algorithm.addEventListener('change', applyAlgorithmFromSelect);
    $('#redo-algorithm').addEventListener('click', applyAlgorithmFromSelect);
  });
})();

// tooltips with jQuery
// ß$(document).ready(() => $('.tooltip').tooltipster());