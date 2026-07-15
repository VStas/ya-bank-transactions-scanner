# ya-bank-transactions-scanner
This Chrome extension extracts YaBank transaction data directly from the web interface and exports it to a CSV file.

# local start
on WSL choose zsh terminal

# todo
+ первой строкой выгружать заголовки
- с первого раза не работает :( Может элемент не находит?? Подебажить
- дубль - такси баллы + рубли. 2 раза транзакция минус рубль
- баллы вообще не надо включать (или отдельный счет под баллы)
- How to make in work in Ya Browser? ALways disabled on bank page
- , vs . in google sheets. Maybe create an option which separator to use
- scan till date
- date input
- check double transactions bug
- small ui to input date and view progress
- maybe include image name and other available info
- map to my format as a plugin
- english language support
+ red transactions support (cancelled)
- Если не распознали месяц, возможно, кинуть ошибку.
- валюта