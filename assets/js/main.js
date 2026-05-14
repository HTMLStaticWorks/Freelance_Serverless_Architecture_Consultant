/**
 * MAIN.JS
 * Website scripts for Freelance Serverless Architecture Consultant
 * Handles animations, theming, RTL, and interactive tools
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheming();
  initRTL();
  initMobileMenu();
  initCostCalculator();
  initColdStartSimulator();
  initSAMDownloader();
  initContactFormValidation();
  initBackToTop();
});

/* ==========================================================================
   0. Back To Top Button
   ========================================================================== */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   1. Theme & Dark Mode Setup
   ========================================================================== */
function initTheming() {
  const themeToggles = document.querySelectorAll('.theme-toggle');
  
  // Set default theme from localStorage or system preferences
  const cachedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = 'light';
  if (cachedTheme) {
    currentTheme = cachedTheme;
  } else if (systemPrefersDark) {
    currentTheme = 'dark';
  }
  
  applyTheme(currentTheme);
  
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update icons on all toggle buttons
  const themeIcons = document.querySelectorAll('.theme-toggle i');
  themeIcons.forEach(icon => {
    if (theme === 'dark') {
      icon.className = 'fas fa-sun';
    } else {
      icon.className = 'fas fa-moon';
    }
  });
}

/* ==========================================================================
   2. RTL (Right-to-Left) Mode Setup
   ========================================================================== */
function initRTL() {
  const rtlToggles = document.querySelectorAll('.rtl-toggle');
  
  const cachedRtl = localStorage.getItem('rtl');
  let isRTL = cachedRtl === 'true';
  
  applyRTL(isRTL);
  
  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentRtl = document.documentElement.getAttribute('dir') === 'rtl';
      applyRTL(!currentRtl);
    });
  });
}

function applyRTL(isRTL) {
  if (isRTL) {
    document.documentElement.setAttribute('dir', 'rtl');
    localStorage.setItem('rtl', 'true');
  } else {
    document.documentElement.removeAttribute('dir');
    localStorage.setItem('rtl', 'false');
  }
  
  // Toggle the buttons' text if they say "RTL" or similar
  const rtlToggles = document.querySelectorAll('.rtl-toggle');
  rtlToggles.forEach(toggle => {
    toggle.textContent = isRTL ? 'LTR' : 'RTL';
  });
}

/* ==========================================================================
   3. Mobile Navigation Menu
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (!menuToggle || !mainNav) return;
  
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    mainNav.classList.toggle('active');
    
    // Change icon between bars and times
    const icon = menuToggle.querySelector('i');
    if (icon) {
      if (mainNav.classList.contains('active')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    }
  });
}

/* ==========================================================================
   4. Serverless Cost Comparison Tool
   ========================================================================== */
function initCostCalculator() {
  const memorySlider = document.getElementById('calc-memory');
  const durationSlider = document.getElementById('calc-duration');
  const invocationsSlider = document.getElementById('calc-invocations');
  
  if (!memorySlider) return; // Not on the calculator page
  
  const memoryVal = document.getElementById('val-memory');
  const durationVal = document.getElementById('val-duration');
  const invocationsVal = document.getElementById('val-invocations');
  
  // Cost outputs
  const costAws = document.getElementById('cost-aws');
  const costGcp = document.getElementById('cost-gcp');
  const costAzure = document.getElementById('cost-azure');
  const costCloudflare = document.getElementById('cost-cloudflare');
  
  // Progress/fill bar variables
  const barAws = document.getElementById('bar-aws');
  const barGcp = document.getElementById('bar-gcp');
  const barAzure = document.getElementById('bar-azure');
  const barCloudflare = document.getElementById('bar-cloudflare');

  function calculateCosts() {
    const mem = parseInt(memorySlider.value);
    const duration = parseInt(durationSlider.value);
    const invocations = parseFloat(invocationsSlider.value) * 1000000; // Millions

    // 1. AWS Lambda Cost Logic (Rough pricing matching AWS pricing)
    // $0.0000166667 per GB-second of compute, $0.20 per million requests, first 1M requests free, first 400k GB-sec free
    const awsFreeTierInvs = 1000000;
    const awsFreeTierCompute = 400000; // GB-seconds
    
    const awsInvsToBill = Math.max(0, invocations - awsFreeTierInvs);
    const awsInvsCost = (awsInvsToBill / 1000000) * 0.20;
    
    const totalGBSeconds = (invocations * duration * (mem / 1024)) / 1000;
    const awsComputeToBill = Math.max(0, totalGBSeconds - awsFreeTierCompute);
    const awsComputeCost = awsComputeToBill * 0.0000166667;
    
    const awsTotalCost = awsInvsCost + awsComputeCost;

    // 2. GCP Cloud Functions Cost Logic
    // Invocations: $0.40 per million. Compute: $0.0000165 per GB-sec.
    // Memory overhead and CPU differences apply, but we approximate:
    const gcpInvsCost = (invocations / 1000000) * 0.40;
    const gcpComputeCost = totalGBSeconds * 0.0000165;
    const gcpTotalCost = gcpInvsCost + gcpComputeCost;

    // 3. Azure Functions Cost Logic
    // Execution: $0.20 per million. Compute: $0.000016 per GB-sec.
    const azureInvsCost = (invocations / 1000000) * 0.20;
    const azureComputeCost = totalGBSeconds * 0.000016;
    const azureTotalCost = azureInvsCost + azureComputeCost;

    // 4. Cloudflare Workers Cost Logic
    // Under Paid Tier: $5/month (includes 10M requests, $0.50 per M after that. Duration is free up to 50ms, then CPU-bound pricing)
    let cfTotalCost = 5.00;
    if (invocations > 10000000) {
      cfTotalCost += ((invocations - 10000000) / 1000000) * 0.50;
    }
    // Adjust slightly for higher memory usage simulated (since standard Workers are capped, workers Unbound charges compute)
    if (mem > 512) {
      cfTotalCost += totalGBSeconds * 0.0000125;
    }

    // Format outputs
    costAws.textContent = `$${awsTotalCost.toFixed(2)}`;
    costGcp.textContent = `$${gcpTotalCost.toFixed(2)}`;
    costAzure.textContent = `$${azureTotalCost.toFixed(2)}`;
    costCloudflare.textContent = `$${cfTotalCost.toFixed(2)}`;

    // Set graph bar widths (normalized against max cost)
    const maxCost = Math.max(awsTotalCost, gcpTotalCost, azureTotalCost, cfTotalCost, 10);
    barAws.style.width = `${Math.max(10, (awsTotalCost / maxCost) * 100)}%`;
    barGcp.style.width = `${Math.max(10, (gcpTotalCost / maxCost) * 100)}%`;
    barAzure.style.width = `${Math.max(10, (azureTotalCost / maxCost) * 100)}%`;
    barCloudflare.style.width = `${Math.max(10, (cfTotalCost / maxCost) * 100)}%`;
  }

  // Update labels and trigger calculation
  memorySlider.addEventListener('input', () => {
    memoryVal.textContent = memorySlider.value;
    calculateCosts();
  });
  durationSlider.addEventListener('input', () => {
    durationVal.textContent = durationSlider.value;
    calculateCosts();
  });
  invocationsSlider.addEventListener('input', () => {
    invocationsVal.textContent = invocationsSlider.value;
    calculateCosts();
  });

  // Run calculation initially
  calculateCosts();
}

/* ==========================================================================
   5. Cold Start Optimization Simulator
   ========================================================================== */
function initColdStartSimulator() {
  const runtimeSelect = document.getElementById('opt-runtime');
  const vpcToggle = document.getElementById('opt-vpc');
  const provisionToggle = document.getElementById('opt-provision');
  
  if (!runtimeSelect) return;
  
  const coldStartVal = document.getElementById('cold-start-time');
  const recommendationBox = document.getElementById('opt-recommendation');
  const timelineBar = document.getElementById('timeline-bar');

  const baseColdStarts = {
    'nodejs': 220,  // ms
    'python': 180,
    'go': 120,
    'rust': 90,
    'java': 850
  };

  function simulate() {
    const runtime = runtimeSelect.value;
    let baseTime = baseColdStarts[runtime] || 200;
    
    // Check VPC impact (VPCs used to add massive cold starts, now it is lower, but still adds ~150ms)
    if (vpcToggle.checked) {
      baseTime += 180;
    }
    
    // Check Provisioned Concurrency impact
    let isProvisioned = provisionToggle.checked;
    if (isProvisioned) {
      // Direct hit! Cold starts disappear to under 10ms
      baseTime = Math.floor(Math.random() * 5) + 3;
    }

    // Display cold start time
    coldStartVal.textContent = `${baseTime} ms`;
    
    // Update visual timeline bar width
    const percentWidth = Math.min(100, (baseTime / 1100) * 100);
    timelineBar.style.width = `${percentWidth}%`;
    if (baseTime > 500) {
      timelineBar.style.backgroundColor = 'var(--danger)';
    } else if (baseTime > 150) {
      timelineBar.style.backgroundColor = 'var(--warning)';
    } else {
      timelineBar.style.backgroundColor = 'var(--success)';
    }

    // Provide recommendations
    let text = "";
    if (isProvisioned) {
      text = "<strong>Recommendation:</strong> Outstanding performance! Provisioned Concurrency pre-warms environments, rendering cold starts obsolete. Recommended for latency-critical user requests.";
    } else if (runtime === 'java' && !isProvisioned) {
      text = "<strong>Recommendation:</strong> Java has heavy runtime overhead leading to high cold starts (850ms+). Try <strong>GraalVM Native Image compilation</strong> or use Provisioned Concurrency to keep latency down.";
    } else if (vpcToggle.checked) {
      text = "<strong>Recommendation:</strong> VPC placement adds network initialization time. Minimize cold start impact by enabling <strong>AWS Hyperplane ENI reuse</strong> or switching to highly-efficient compiled runtimes like Go or Rust.";
    } else {
      text = `<strong>Recommendation:</strong> For ${runtime.toUpperCase()} in standard serverless, optimize payload size, avoid importing bulky libraries, and leverage global scope initialization to cache clients.`;
    }
    
    recommendationBox.innerHTML = text;
  }

  runtimeSelect.addEventListener('change', simulate);
  vpcToggle.addEventListener('change', simulate);
  provisionToggle.addEventListener('change', simulate);

  simulate();
}

/* ==========================================================================
   6. Dynamic SAM (Serverless Application Model) Template Downloader
   ========================================================================== */
function initSAMDownloader() {
  const downloadBtns = document.querySelectorAll('.download-sam-btn');
  
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const designName = btn.getAttribute('data-design') || 'api-gateway-lambda';
      
      let templateContent = '';
      let filename = 'template.yaml';

      if (designName === 'api-gateway-lambda') {
        filename = 'sam-api-gateway-lambda.yaml';
        templateContent = `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Premium API Gateway and Lambda serverless stack.

Globals:
  Function:
    Timeout: 10
    MemorySize: 512
    Runtime: nodejs18.x
    Architectures:
      - arm64

Resources:
  MySecureApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: app.lambdaHandler
      Events:
        GetDetails:
          Type: Api
          Properties:
            Path: /v1/designs
            Method: get
`;
      } else if (designName === 'sqs-lambda-db') {
        filename = 'sam-async-sqs-dynamo.yaml';
        templateContent = `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Async event processing with SQS, Lambda, and DynamoDB.

Resources:
  ProcessingQueue:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 90

  InvoiceTable:
    Type: AWS::Serverless::SimpleTable
    Properties:
      PrimaryKey:
        Name: InvoiceId
        Type: String

  QueueProcessorFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: processor.handler
      Runtime: python3.11
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref InvoiceTable
      Events:
        QueueEvent:
          Type: SQS
          Properties:
            Queue: !GetAtt ProcessingQueue.Arn
            BatchSize: 10
`;
      } else {
        filename = 'sam-s3-trigger.yaml';
        templateContent = `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: S3 Object Upload trigger executing image recognition.

Resources:
  UploadBucket:
    Type: AWS::S3::Bucket

  ImageProcessorFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: index.handler
      Runtime: go1.x
      Policies:
        - RekognitionDetectOnlyPolicy: {}
        - S3ReadPolicy:
            BucketName: !Ref UploadBucket
      Events:
        BucketUploadEvent:
          Type: S3
          Properties:
            Bucket: !Ref UploadBucket
            Events: s3:ObjectCreated:*
`;
      }

      // Download file logic
      const blob = new Blob([templateContent], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
}

/* ==========================================================================
   7. Form Validation (Contact Page)
   ========================================================================== */
function initContactFormValidation() {
  const form = document.getElementById('consultation-form');
  if (!form) return;

  const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  
  form.addEventListener('submit', (e) => {
    let isValid = true;

    inputs.forEach(input => {
      // Clean previous error marks
      input.classList.remove('input-error');
      const errSpan = input.parentNode.querySelector('.error-msg');
      if (errSpan) errSpan.remove();

      if (!input.value.trim()) {
        isValid = false;
        input.classList.add('input-error');
        
        // Create error tooltip
        const tooltip = document.createElement('span');
        tooltip.className = 'error-msg';
        tooltip.innerHTML = '<i class="fas fa-exclamation-circle"></i> This field is required';
        tooltip.style.color = 'var(--danger)';
        tooltip.style.fontSize = '0.8rem';
        tooltip.style.marginTop = '4px';
        tooltip.style.display = 'block';
        input.parentNode.appendChild(tooltip);
      } else if (input.type === 'email') {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(input.value.trim())) {
          isValid = false;
          input.classList.add('input-error');
          
          const tooltip = document.createElement('span');
          tooltip.className = 'error-msg';
          tooltip.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid email address';
          tooltip.style.color = 'var(--danger)';
          tooltip.style.fontSize = '0.8rem';
          tooltip.style.marginTop = '4px';
          tooltip.style.display = 'block';
          input.parentNode.appendChild(tooltip);
        }
      }
    });

    if (!isValid) {
      e.preventDefault(); // Stop form submission
    } else {
      e.preventDefault();
      // Show elegant success state
      const formContainer = form.parentNode;
      formContainer.innerHTML = `
        <div class="success-alert" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 4rem; color: var(--success); margin-bottom: 20px;">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 style="margin-bottom: 12px;">Consultation Request Received!</h3>
          <p style="color: var(--text-muted); margin-bottom: 24px;">Thank you for reaching out. I will review your serverless parameters and respond with diagnostic insights within 24 business hours.</p>
          <a href="../index.html" class="btn btn-primary">Return Home</a>
        </div>
      `;
    }
  });

  // Real-time clearance of validation errors on input
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const errSpan = input.parentNode.querySelector('.error-msg');
      if (errSpan) errSpan.remove();
    });
  });
}
