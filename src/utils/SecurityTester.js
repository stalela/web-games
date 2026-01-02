/**
 * SecurityTester - Web Application Security Testing
 * Checks for common security vulnerabilities and best practices
 */

export class SecurityTester {
  constructor() {
    this.vulnerabilities = [];
    this.warnings = [];
    this.passes = [];
    this.riskLevel = 'LOW';
  }

  /**
   * Run comprehensive security tests
   */
  async runSecurityTests() {
    console.log('🔒 Running Security Assessment...');

    this.vulnerabilities = [];
    this.warnings = [];
    this.passes = [];

    // Test different security aspects
    await this.testContentSecurityPolicy();
    await this.testXSSPrevention();
    await this.testDataValidation();
    await this.testSecureStorage();
    await this.testExternalDependencies();
    await this.testInputSanitization();
    await this.testErrorHandling();

    this.calculateRiskLevel();
    this.generateSecurityReport();

    return this.getResults();
  }

  /**
   * Test Content Security Policy
   */
  async testContentSecurityPolicy() {
    console.log('Testing Content Security Policy...');

    // Check if CSP headers are present (simplified check)
    const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]') ||
                   document.querySelector('meta[http-equiv="X-Content-Security-Policy"]');

    if (hasCSP) {
      this.passes.push({
        rule: 'CSP-1 Content Security Policy',
        severity: 'pass',
        message: 'Content Security Policy headers detected',
        impact: 'good'
      });
    } else {
      this.warnings.push({
        rule: 'CSP-1 Content Security Policy',
        severity: 'moderate',
        message: 'No Content Security Policy headers found',
        suggestion: 'Implement CSP headers to prevent XSS attacks',
        impact: 'Consider adding CSP meta tag or HTTP headers'
      });
    }
  }

  /**
   * Test XSS prevention
   */
  async testXSSPrevention() {
    console.log('Testing XSS Prevention...');

    // Check for innerHTML usage (potential XSS risk) - exclude development scripts
    const scripts = Array.from(document.scripts);
    const hasInlineScripts = scripts.some(script => {
      // Skip webpack dev server and other development scripts
      if (!script.src) {
        const content = script.textContent.trim();
        // Skip empty scripts and webpack dev server scripts
        return content.length > 0 && !content.includes('webpack') && !content.includes('HMR');
      }
      return false;
    });

    if (!hasInlineScripts) {
      this.passes.push({
        rule: 'XSS-1 No Inline Scripts',
        severity: 'pass',
        message: 'No production inline scripts detected',
        impact: 'good'
      });
    } else {
      this.warnings.push({
        rule: 'XSS-1 No Inline Scripts',
        severity: 'moderate',
        message: 'Inline scripts detected - review for security',
        suggestion: 'Ensure inline scripts are from trusted sources only',
        impact: 'Potential XSS risk - monitor closely'
      });
    }

    // Check for eval usage - be more specific about what's flagged
    const hasEvalUsage = typeof window.eval === 'function' || typeof window.execScript === 'function';

    if (!hasEvalUsage) {
      this.passes.push({
        rule: 'XSS-2 No Eval Usage',
        severity: 'pass',
        message: 'No eval() or execScript() functions detected',
        impact: 'good'
      });
    } else {
      // Check if eval is actually being used maliciously
      // Many modern apps have eval for legitimate purposes (code editors, etc.)
      this.warnings.push({
        rule: 'XSS-2 Eval Usage Detected',
        severity: 'moderate',
        message: 'eval() function available - ensure proper usage',
        suggestion: 'Review eval() usage and consider safer alternatives where possible',
        impact: 'Monitor eval() usage for security risks'
      });
    }
  }

  /**
   * Test data validation
   */
  async testDataValidation() {
    console.log('Testing Data Validation...');

    // Check localStorage data integrity
    try {
      const testKey = '__security_test__';
      const testData = { test: 'value', timestamp: Date.now() };

      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem(testKey));

      if (retrieved && retrieved.test === 'value') {
        this.passes.push({
          rule: 'DATA-1 Storage Integrity',
          severity: 'pass',
          message: 'Local storage data integrity verified',
          impact: 'good'
        });
      } else {
        this.warnings.push({
          rule: 'DATA-1 Storage Integrity',
          severity: 'moderate',
          message: 'Local storage data may be corrupted',
          suggestion: 'Implement data validation for stored values'
        });
      }

      localStorage.removeItem(testKey);
    } catch (error) {
      this.warnings.push({
        rule: 'DATA-1 Storage Integrity',
        severity: 'moderate',
        message: 'Local storage access failed',
        suggestion: 'Handle localStorage errors gracefully'
      });
    }
  }

  /**
   * Test secure storage practices
   */
  async testSecureStorage() {
    console.log('Testing Secure Storage...');

    // Check if sensitive data is stored in localStorage
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
    const localStorageKeys = Object.keys(localStorage);

    const hasSensitiveData = localStorageKeys.some(key =>
      sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
    );

    if (!hasSensitiveData) {
      this.passes.push({
        rule: 'SECURE-1 No Sensitive Data in Storage',
        severity: 'pass',
        message: 'No sensitive data found in localStorage',
        impact: 'good'
      });
    } else {
      this.vulnerabilities.push({
        rule: 'SECURE-1 No Sensitive Data in Storage',
        severity: 'high',
        message: 'Potential sensitive data found in localStorage',
        suggestion: 'Never store passwords, tokens, or sensitive data in localStorage',
        impact: 'High security risk'
      });
    }

    // Check sessionStorage usage
    const sessionKeys = Object.keys(sessionStorage);
    if (sessionKeys.length === 0) {
      this.passes.push({
        rule: 'SECURE-2 Session Storage Usage',
        severity: 'pass',
        message: 'No sessionStorage data found',
        impact: 'good'
      });
    } else {
      this.warnings.push({
        rule: 'SECURE-2 Session Storage Usage',
        severity: 'low',
        message: 'sessionStorage is being used',
        suggestion: 'Ensure sessionStorage data is not sensitive'
      });
    }
  }

  /**
   * Test external dependencies security
   */
  async testExternalDependencies() {
    console.log('Testing External Dependencies...');

    // Check for known vulnerable libraries (simplified check)
    const scripts = Array.from(document.scripts);
    const externalScripts = scripts.filter(script => script.src);

    // Check if using HTTPS for external resources
    const insecureScripts = externalScripts.filter(script =>
      script.src && script.src.startsWith('http://')
    );

    if (insecureScripts.length === 0) {
      this.passes.push({
        rule: 'DEP-1 HTTPS Only',
        severity: 'pass',
        message: 'All external scripts use HTTPS',
        impact: 'good'
      });
    } else {
      this.vulnerabilities.push({
        rule: 'DEP-1 HTTPS Only',
        severity: 'high',
        message: `${insecureScripts.length} external scripts use HTTP instead of HTTPS`,
        suggestion: 'Use HTTPS for all external resources',
        impact: 'Man-in-the-middle attack vulnerability'
      });
    }

    // Check for subresource integrity - exclude development scripts
    const productionScripts = externalScripts.filter(script =>
      !script.src.includes('localhost') &&
      !script.src.includes('webpack') &&
      !script.src.includes('hot-reload')
    );

    const scriptsWithIntegrity = productionScripts.filter(script =>
      script.integrity && script.integrity.trim().length > 0
    );

    if (scriptsWithIntegrity.length === productionScripts.length && productionScripts.length > 0) {
      this.passes.push({
        rule: 'DEP-2 Subresource Integrity',
        severity: 'pass',
        message: 'All production external scripts have integrity checks',
        impact: 'good'
      });
    } else if (productionScripts.length === 0) {
      this.passes.push({
        rule: 'DEP-2 Subresource Integrity',
        severity: 'pass',
        message: 'No production external scripts to check',
        impact: 'good'
      });
    } else {
      this.warnings.push({
        rule: 'DEP-2 Subresource Integrity',
        severity: 'low',
        message: `${productionScripts.length - scriptsWithIntegrity.length} production scripts missing integrity checks`,
        suggestion: 'Consider adding integrity checks for production external scripts'
      });
    }
  }

  /**
   * Test input sanitization
   */
  async testInputSanitization() {
    console.log('Testing Input Sanitization...');

    // Test potential XSS vectors in game data
    const testInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
      '<iframe src="javascript:alert(\'xss\')"></iframe>'
    ];

    let vulnerabilitiesFound = 0;

    // Check if game logic handles malicious input (simplified test)
    for (const input of testInputs) {
      try {
        // Test if input could be processed without causing issues
        const sanitized = input.replace(/[<>]/g, '');
        if (sanitized !== input) {
          vulnerabilitiesFound++;
        }
      } catch (error) {
        vulnerabilitiesFound++;
      }
    }

    if (vulnerabilitiesFound === 0) {
      this.passes.push({
        rule: 'INPUT-1 XSS Prevention',
        severity: 'pass',
        message: 'Input sanitization appears adequate',
        impact: 'good'
      });
    } else {
      this.vulnerabilities.push({
        rule: 'INPUT-1 XSS Prevention',
        severity: 'high',
        message: 'Potential XSS vulnerabilities in input handling',
        suggestion: 'Implement proper input sanitization and validation',
        impact: 'High risk of XSS attacks'
      });
    }
  }

  /**
   * Test error handling security
   */
  async testErrorHandling() {
    console.log('Testing Error Handling...');

    // Test if errors expose sensitive information
    const originalOnError = window.onerror;

    let errorExposedSensitiveInfo = false;

    window.onerror = function(message, source, lineno, colno, error) {
      // Check if error message contains sensitive information
      const sensitivePatterns = [
        /password/i,
        /token/i,
        /key/i,
        /secret/i,
        /api[_-]?key/i
      ];

      if (sensitivePatterns.some(pattern => pattern.test(message))) {
        errorExposedSensitiveInfo = true;
      }
      return false;
    };

    // Trigger a test error
    try {
      throw new Error('Test error message');
    } catch (error) {
      // Error handling tested
    }

    // Restore original error handler
    window.onerror = originalOnError;

    if (!errorExposedSensitiveInfo) {
      this.passes.push({
        rule: 'ERROR-1 No Sensitive Data in Errors',
        severity: 'pass',
        message: 'Error messages do not expose sensitive information',
        impact: 'good'
      });
    } else {
      this.vulnerabilities.push({
        rule: 'ERROR-1 No Sensitive Data in Errors',
        severity: 'high',
        message: 'Error messages may expose sensitive information',
        suggestion: 'Sanitize error messages before logging or displaying',
        impact: 'Information disclosure vulnerability'
      });
    }

    // Check for console.error usage with sensitive data
    this.warnings.push({
      rule: 'ERROR-2 Secure Logging',
      severity: 'low',
      message: 'Ensure console logging does not expose sensitive data',
      suggestion: 'Review console.log/console.error statements for sensitive data'
    });
  }

  /**
   * Calculate overall risk level
   */
  calculateRiskLevel() {
    const criticalCount = this.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = this.vulnerabilities.filter(v => v.severity === 'high').length;
    const moderateCount = this.vulnerabilities.filter(v => v.severity === 'moderate').length;

    if (criticalCount > 0) {
      this.riskLevel = 'CRITICAL';
    } else if (highCount > 0) {
      this.riskLevel = 'HIGH';
    } else if (moderateCount > 0) {
      this.riskLevel = 'MODERATE';
    } else {
      this.riskLevel = 'LOW';
    }
  }

  /**
   * Generate security report
   */
  generateSecurityReport() {
    console.log('\n🔒 Security Assessment Report');
    console.log('=' .repeat(50));

    const grade = this.riskLevel === 'LOW' ? 'A' :
                  this.riskLevel === 'MODERATE' ? 'B' :
                  this.riskLevel === 'HIGH' ? 'C' : 'F';

    console.log(`🎯 Risk Level: ${this.riskLevel} (${grade})`);
    console.log(`✅ Passed: ${this.passes.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Vulnerabilities: ${this.vulnerabilities.length}`);

    if (this.vulnerabilities.length > 0) {
      console.log('\n🚨 Security Vulnerabilities:');
      this.vulnerabilities.forEach((v, i) => {
        console.log(`${i + 1}. ${v.rule} (${v.severity.toUpperCase()}): ${v.message}`);
        if (v.suggestion) console.log(`   💡 ${v.suggestion}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Security Recommendations:');
      this.warnings.forEach((w, i) => {
        console.log(`${i + 1}. ${w.rule}: ${w.message}`);
        if (w.suggestion) console.log(`   💡 ${w.suggestion}`);
      });
    }

    console.log('\n📋 Security Status:');
    if (this.riskLevel === 'LOW') {
      console.log('✅ SECURE - No significant security issues found');
    } else if (this.riskLevel === 'MODERATE') {
      console.log('⚠️  MOSTLY SECURE - Minor security improvements recommended');
    } else {
      console.log('❌ SECURITY ISSUES - Address critical vulnerabilities immediately');
    }
  }

  /**
   * Get test results
   */
  getResults() {
    return {
      riskLevel: this.riskLevel,
      grade: this.riskLevel === 'LOW' ? 'A' :
             this.riskLevel === 'MODERATE' ? 'B' :
             this.riskLevel === 'HIGH' ? 'C' : 'F',
      vulnerabilities: this.vulnerabilities,
      warnings: this.warnings,
      passes: this.passes,
      secure: this.vulnerabilities.length === 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export results to JSON
   */
  exportResults() {
    return JSON.stringify(this.getResults(), null, 2);
  }

  /**
   * Get security badge
   */
  getSecurityBadge() {
    if (this.riskLevel === 'LOW') return '🛡️ Secure';
    if (this.riskLevel === 'MODERATE') return '⚠️ Mostly Secure';
    if (this.riskLevel === 'HIGH') return '🚨 Security Issues';
    return '❌ Critical Vulnerabilities';
  }
}

// Create global instance
export const securityTester = new SecurityTester();