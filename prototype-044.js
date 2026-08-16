/* Keneflex 0.4.4b loader.
   Keep the stable 0.4.4 core separate, then layer the Conversation Director on top.
   document.write is used here because this file is loaded synchronously during page parsing,
   which guarantees both scripts execute before the inline recommendation controls below it. */
document.write('<script src="prototype-044-core.js?v=044b"><\/script><script src="prototype-044b-patch.js?v=044b"><\/script>');
