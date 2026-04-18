(function() {
    let qaList = [];
    let paragraphs = document.querySelectorAll('p');

    paragraphs.forEach(p => {
        let text = p.innerText.trim();
        
        if (/^\d+[\.\)]\s/.test(text)) {
            let question = text.replace(/^\d+[\.\)]\s*/, '').trim();
            let nextEl = p.nextElementSibling;
            
            while(nextEl && nextEl.tagName !== 'UL' && nextEl.tagName !== 'P') {
                nextEl = nextEl.nextElementSibling;
            }

            if (nextEl && nextEl.tagName === 'UL') {
                // JAVÍTÁS: Itt a 'find' helyett 'filter'-t használunk, hogy az ÖSSZES jó választ megtaláljuk!
                let correctLis = Array.from(nextEl.querySelectorAll('li')).filter(li => {
                    return li.innerHTML.includes('color:') || 
                           li.innerHTML.includes('font-weight: bold') ||
                           li.querySelector('strong') || 
                           li.querySelector('b') ||
                           li.innerText.includes('(*)'); // Néha csillaggal jelölik a jót
                });

                if (correctLis.length > 0) {
                    // Kigyűjtjük az összes jó választ egy tömbbe
                    let answers = correctLis.map(li => li.innerText.replace(/^[A-Z][\.\)]\s*/, '').trim());
                    qaList.push({ question: question, answers: answers });
                }
            }
        }
    });

    if (qaList.length === 0) {
        alert("Sajnos nem találtam kérdés-válasz párokat.");
        return;
    }

    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(qaList, null, 2));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "answers.json");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    console.log(`🎉 Sikeresen kimentve ${qaList.length} kérdés a JSON fájlba! (Többválaszos kérdések is támogatva)`);
})();