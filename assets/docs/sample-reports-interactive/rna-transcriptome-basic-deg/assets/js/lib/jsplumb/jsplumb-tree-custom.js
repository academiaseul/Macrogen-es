
   

        function positioningBlockBug() {
            var oldNode = window.treemain.nodeById(2);
            //var newNode = $('#node_2_new');
            var newNode = $('    <div id="node_2" class="window hidden"\n' +
                '         data-id="2"\n' +
                '         data-parent="0"\n' +
                '         data-first-child="6"\n' +
                '         data-next-sibling="3">\n' +
                '        Node 2 NEW\n' +
                '    </div>\n');
            if (oldNode) {
                // butta il nodo nel container
                oldNode.replaceWith(newNode);
                // rimostra il nodo
                newNode.id = 'node_2';
                newNode.show();
                // aggiorna l'albero
                window.treemain.update();
            }

        }


