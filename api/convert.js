// api/convert.js
const { parse } = require('papaparse');
const { parse: parseJson } = require('json2csv');

module.exports = (req, res) => {
  const { data, conversionType } = req.body;
  try {
    let converted;
    if (conversionType === "jsonToCsv") {
      const jsonObj = JSON.parse(data);
      converted = parseJson(jsonObj);
    } else if (conversionType === "csvToJson") {
      const result = parse(data, { header: true });
      converted = JSON.stringify(result.data);
    }
    res.json({ converted });
  } catch (err) {
    res.status(500).json({ error: "An error occurred during file conversion." });
  }
};
