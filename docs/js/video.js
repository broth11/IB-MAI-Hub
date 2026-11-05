// YouTube player control. The iframe is embedded with enablejsapi=1, so we can seek by postMessage.
export function seekVideo(seconds) {
  const f = document.getElementById('yt');
  if (!f || !f.contentWindow) return;
  const send = (func, args) => f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  send('seekTo', [seconds, true]);
  send('playVideo', []);
}
