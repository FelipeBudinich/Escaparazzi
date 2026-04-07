(function (root) {
  var hasOwn = Object.prototype.hasOwnProperty;

  function hasValue(object, key) {
    return !!object && hasOwn.call(object, key) && object[key] !== undefined && object[key] !== null;
  }

  function parseBooleanFlag(value) {
    var normalized;

    if (value === true || value === 1) {
      return true;
    }

    if (typeof value === 'string') {
      normalized = value.toLowerCase();
      return normalized === '1' ||
        normalized === 'true' ||
        normalized === 'yes' ||
        normalized === 'on';
    }

    return false;
  }

  function mergeOverrides(base, overrides) {
    var merged = {};
    var key;

    base = base || {};

    for (key in base) {
      if (hasOwn.call(base, key)) {
        merged[key] = base[key];
      }
    }

    if (!overrides) {
      return merged;
    }

    for (key in overrides) {
      if (hasOwn.call(overrides, key) && overrides[key] !== undefined) {
        merged[key] = overrides[key];
      }
    }

    return merged;
  }

  function readQueryOverrides(locationSearch) {
    var overrides = {};
    var params;
    var debugValue;
    var overlayValue;
    var logValue;

    if (!locationSearch || typeof URLSearchParams === 'undefined') {
      return overrides;
    }

    params = new URLSearchParams(locationSearch);
    debugValue = params.get('debug');
    overlayValue = params.get('debugOverlay');
    logValue = params.get('debugLog');

    if (debugValue !== null) {
      overrides.enabled = parseBooleanFlag(debugValue === '' ? 'true' : debugValue);
    }

    if (overlayValue !== null) {
      overrides.renderOverlay = parseBooleanFlag(overlayValue === '' ? 'true' : overlayValue);
    }

    if (logValue !== null) {
      overrides.logEvents = parseBooleanFlag(logValue === '' ? 'true' : logValue);
    }

    return overrides;
  }

  function createDebugConfig(overrides) {
    var enabled = hasValue(overrides, 'enabled') ? !!overrides.enabled : false;
    var renderOverlay = hasValue(overrides, 'renderOverlay') ? !!overrides.renderOverlay : enabled;
    var logEvents = hasValue(overrides, 'logEvents') ? !!overrides.logEvents : enabled;

    return Object.freeze({
      enabled: enabled,
      renderOverlay: renderOverlay,
      logEvents: logEvents
    });
  }

  function resolveDebugConfig(rootScope) {
    var explicitOverrides = rootScope && rootScope.EscaparazziDebug ? rootScope.EscaparazziDebug : null;
    var queryOverrides = rootScope && rootScope.location ? readQueryOverrides(rootScope.location.search) : null;

    return createDebugConfig(mergeOverrides(explicitOverrides, queryOverrides));
  }

  function isDebugOverlayEnabled(config) {
    return !!(config && config.renderOverlay);
  }

  function isDebugLoggingEnabled(config) {
    return !!(config && config.logEvents);
  }

  function debugLog(config, eventName, details) {
    if (!isDebugLoggingEnabled(config) || !root.console || typeof root.console.log !== 'function') {
      return;
    }

    if (details === undefined) {
      root.console.log('[Escaparazzi debug]', eventName);
      return;
    }

    root.console.log('[Escaparazzi debug]', eventName, details);
  }

  var DEBUG_CONFIG = resolveDebugConfig(root);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      DEBUG_CONFIG: DEBUG_CONFIG,
      createDebugConfig: createDebugConfig,
      isDebugOverlayEnabled: isDebugOverlayEnabled,
      isDebugLoggingEnabled: isDebugLoggingEnabled,
      debugLog: debugLog
    };
  }

  root.EscaparazziCore = root.EscaparazziCore || {};
  root.EscaparazziCore.DEBUG_CONFIG = DEBUG_CONFIG;
  root.EscaparazziCore.createDebugConfig = createDebugConfig;
  root.EscaparazziCore.isDebugOverlayEnabled = isDebugOverlayEnabled;
  root.EscaparazziCore.isDebugLoggingEnabled = isDebugLoggingEnabled;
  root.EscaparazziCore.debugLog = function (eventName, details) {
    debugLog(DEBUG_CONFIG, eventName, details);
  };
}(typeof globalThis !== 'undefined' ? globalThis : this));
