alert('hi')
console.log('hello hello hello')

function findRowById(id) {
  return document.querySelector(`div[data-index="${id}"]`)
}

function findTransactions() {
    const transationNodes = document.evaluate(
        '//div[contains(@class, \'operationInfoWrapper\')]',
        document,
        null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null
      );

      try {
        let thisNode = transationNodes.iterateNext();
      
        while (thisNode) {
          const operationDiv = thisNode.querySelector('[class*="operationName"]');
          const operationDescriptionDiv = thisNode.querySelector('[class*="operationDescription"]');
          const operationBalanceChangeDiv = thisNode.querySelector('[class*="balanceChange"]');
          if (operationDiv) {
            console.log({
              operation: operationDiv.textContent,
              description: operationDescriptionDiv.textContent,
              balanceChange: operationBalanceChangeDiv.textContent
            })

            console.log();
          } else {
            console.log('no info')
          }

          // console.log(thisNode.textContent);
          thisNode = transationNodes.iterateNext();
        }
      } catch (e) {
        console.error(`Error: Document tree modified during iteration ${e}`);
      }

    


    console.log(transationNodes);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('received a message');
  if (request.action === "parsePage") {
      const data = 'hello'
      findTransactions();
      sendResponse({ data: data });
    }
    return true; // Необходимо для асинхронного ответа
  }
);

