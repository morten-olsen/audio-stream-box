const express = require('express');
const createMic = require('./mic');
const createBonjour = require('bonjour');
const lame = require('lame');

const create = ({
  name,
  port,
}) => {
  const bonjour = createBonjour();
  const app = express();
  app.get('/stream', (request, response) => {
    const mic = createMic();
    const encoder = new lame.Encoder({
      channels: 2,
      bitDepth: 16,
      sampleRate: 44100,
      bitRate: 128,
      outSampleRate: 22050,
      mode: lame.STEREO,
    });
    response.contentType('audio/mpeg');
    response.set('Transfer-Encoding', 'chunked');
    response.set('Content-Disposition', 'attachment; filename=stream.mp3');
    response.once('end', () => {
      console.log('end');
    });
    const audio = mic.pipe(encoder);
    audio.on('data', (data) => {
      //console.log('data')
        // response.send(data);
    });
    audio.pipe(response);
    //mic.pipe(encoder).pipe(response);
  });

  app.get('/info', (request, response) => {
    response.json({
      name,
    });
  });

  app.get('/', (req, res) => {
res.end(`
    <html>
      <body>
        <audio controls src="./stream" />
      </body>
</html>
    `);
  });

  app.listen(port, () => {
    console.log('Server running on port ' + port);
    bonjour.publish({ name: 'WirelessMediaStream', type: 'http', port });
  });
};

module.exports = create;

