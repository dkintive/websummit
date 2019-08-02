const downloadLink = document.getElementById('download-button');
const tableBody = document.querySelector('tbody');
const loader = downloadLink.addEventListener('click', () => downloadCSV({ filename: "speakers-list.csv" }))
let speakersList = []
const speakerProps = [
    'index',
    'first_name',
    'last_name',
    'job_title',
    'company_name',
    'country']

window.onload = async (e) => {
    await fetchSpeakers()
    createListOfSpeaker()
    document.querySelector('.loader').style.display = 'none'
};

function createListOfSpeaker() {

    speakersList.forEach((speaker, index) => {
        speaker.index = index + 2
        const speakerRow = document.createElement('tr')


        speakerProps.forEach(property => {
            const speakerElement = document.createElement('td');
            speakerElement.setAttribute(property, speaker[property]);
            speakerElement.innerHTML = speaker[property];
            speakerRow.appendChild(speakerElement)
            tableBody.appendChild(speakerRow)
        })
    })

}

async function fetchSpeakers() {
    const speakers = [];
    speakerList = [];

    for (let page = 0; page < 7; page++) {
        try {
            const response = await fetch(`https://api.cilabs.com/conferences/ws19/lists/speakers?per_page=60&page=${page}`)
            const data = await response.json()

            data.data.forEach(speaker => {
                const newSpeaker = {
                    first_name: speaker.first_name,
                    last_name: speaker.last_name,
                    job_title: speaker.job_title,
                    company_name: speaker.company_name,
                    country: speaker.country,
                    //bio: speaker.bio,
                    //bio: 'test, test'
                }
                speakers.push(newSpeaker)
            });

        } catch (error) {
            console.log("TCL: fetchSpeaker -> error", error)

        }

    }

    speakers.map((speaker, index) => {
        const duplicate = speakersList.find(speakerEl => speakerEl.first_name === speaker.first_name && speakerEl.last_name === speaker.last_name)
        if (duplicate) return
        speakersList.push(speaker)
    })
}

function convertArrayOfObjectsToCSV(args) {
    let result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data === null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';


    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]).filter(key => key !== 'index')


    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {
        ctr = 0;
        keys.forEach(function (key) {
            if (ctr > 0) result += columnDelimiter;
            result += item[key];
            ctr++;
        });
        result += lineDelimiter;

    });

    return result;
}

async function downloadCSV(args) {
    let data, filename, link;

    console.log('list', speakersList)
    if (!speakersList || !speakersList.length) {
        await fetchSpeakers();
    }

    let csv = convertArrayOfObjectsToCSV({
        data: speakersList
    });
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();

}

