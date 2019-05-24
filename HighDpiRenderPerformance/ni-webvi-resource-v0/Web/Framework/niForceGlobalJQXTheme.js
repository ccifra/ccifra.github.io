//****************************************
// Custom Element Extensions
// National Instruments Copyright 2017
//****************************************
// This file should be loaded immediately after jqxcore.js
// Pattern taken from here: http://www.jqwidgets.com/community/topic/setting-theme-for-all-widgets-globally/#post-53715
// Looks like jqWidgets does not support global styles, hopefully they all pull in this default. If not have to modify per control.
// Which is about 100 locations to validate based on the regex jqx\w*\(
// Note: The 'legacy' theme is used on JQX CSS in jqx.legacy.css, and is meant to target legacy JQX widgets that NI has not
// not restyled (e.g. data grid).
'use strict';
$.jqx.theme = 'legacy';
//# sourceMappingURL=niForceGlobalJQXTheme.js.map