#! /usr/bin/env node

/**
 * Heavily inspired by create-vite
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec as cp_exec } from 'node:child_process'
import mri from 'mri'
import * as prompts from '@clack/prompts'
import colors from 'picocolors'

const argv = mri(process.argv.slice(2), {
    alias: { h: 'help', t: 'template', d: 'description', a: 'author', l: 'license' },
    boolean: ['help', 'overwrite'],
    string: ['template', 'description', 'author', 'license'],
})
const cwd = process.cwd()

const TEMPLATES_NAMES = [
    'basic',
    'curved',
    'wide',
    'advanced'
]

const TEMPLATES = [
    {
        name: 'basic',
        display: 'Basic',
        color: colors.yellow,
    },
    {
        name: 'curved',
        display: 'Curved',
        color: colors.green,
    },
    {
        name: 'wide',
        display: 'Wide',
        color: colors.cyan,
    },
    {
        name: 'advanced',
        display: 'Advanced',
        color: colors.blue,
        logLevel: 4,
        validators: [
            {
                name: 'ajv',
                display: 'Ajv',
                color: colors.green
            },
            {
                name: 'joi',
                display: 'Joi',
                color: colors.red
            },
            {
                name: 'typebox',
                display: 'TypeBox',
                color: colors.yellow
            },
            {
                name: 'zod',
                display: 'Zod',
                color: colors.blue
            }
        ]
    }
]

// prettier-ignore
const helpMessage = `\
  Usage: create-novice-frame [OPTION]... [DIRECTORY]
  
  Create a new @novice1/frame project in TypeScript.
  With no arguments, start the CLI in interactive mode.
  
  Options:
    -a, --author NAME          author of package
    -d, --description TEXT     description of package
    -l, --license NAME         use a specific license
    -t, --template NAME        use a specific template
    
  
  Available templates:
  ${TEMPLATES[0].color(TEMPLATES[0].name)}
  ${TEMPLATES[1].color(TEMPLATES[1].name)}
  ${TEMPLATES[2].color(TEMPLATES[2].name)}
  ${TEMPLATES[2].color(TEMPLATES[3].name)}`

// prettier-ignore
const gitignoreContent = `
/dist

#
.DS_Store

# IDEs
/.idea
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# parcel-bundler cache (https://parceljs.org/)
.parcel-cache

# temp and cache directory
.temp
.cache

# vitepress build output
**/.vitepress/dist

# vitepress cache directory
**/.vitepress/cache

# Docusaurus cache and generated files
.docusaurus

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
`

const defaultTargetDir = 'novie-frame-project'

async function init() {
    const argTargetDir = argv._[0]
        ? formatTargetDir(String(argv._[0]))
        : undefined
    const argAuthor = argv.author
    const argDescription = argv.description
    const argLicense = argv.license
    const argTemplate = argv.template
    const argOverwrite = argv.overwrite

    const help = argv.help
    if (help) {
        console.log(helpMessage)
        return
    }

    const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
    const cancel = () => prompts.cancel('Operation cancelled')

    // 1. Get project name and target dir
    let targetDir = argTargetDir
    if (!targetDir) {
        const projectName = await prompts.text({
            message: 'Project name:',
            defaultValue: defaultTargetDir,
            placeholder: defaultTargetDir,
        })
        if (prompts.isCancel(projectName)) return cancel()
        targetDir = formatTargetDir(projectName)
    }

    // 2. Handle directory if exist and not empty
    if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
        const overwrite = argOverwrite
            ? 'yes'
            : await prompts.select({
                message:
                    (targetDir === '.'
                        ? 'Current directory'
                        : `Target directory "${targetDir}"`) +
                    ` is not empty. Please choose how to proceed:`,
                options: [
                    {
                        label: 'Cancel operation',
                        value: 'no',
                    },
                    {
                        label: 'Remove existing files and continue',
                        value: 'yes',
                    },
                    {
                        label: 'Ignore files and continue',
                        value: 'ignore',
                    },
                ],
            })
        if (prompts.isCancel(overwrite)) return cancel()
        switch (overwrite) {
            case 'yes':
                emptyDir(targetDir)
                break
            case 'no':
                cancel()
                return
        }
    }

    // 3. Get package name
    let packageName = path.basename(path.resolve(targetDir))
    if (!isValidPackageName(packageName)) {
        const packageNameResult = await prompts.text({
            message: 'Package name:',
            defaultValue: toValidPackageName(packageName),
            placeholder: toValidPackageName(packageName),
            validate(dir) {
                if (!isValidPackageName(dir)) {
                    return 'Invalid package.json name'
                }
            },
        })
        if (prompts.isCancel(packageNameResult)) return cancel()
        packageName = packageNameResult
    }

    // 4. Choose a template
    let template = argTemplate
    let validator = ''
    let logLevel = 2
    let hasInvalidArgTemplate = false
    if (argTemplate && !TEMPLATES_NAMES.includes(argTemplate)) {
        template = undefined
        hasInvalidArgTemplate = true
    }

    if (!template) {
        const templateObj = await prompts.select({
            message: hasInvalidArgTemplate
                ? `"${argTemplate}" isn't a valid template. Please choose from below: `
                : 'Select a template:',
            options: TEMPLATES.map((t) => {
                const templateColor = t.color
                return {
                    label: templateColor(t.display || t.name),
                    value: t,
                }
            }),
        })
        if (prompts.isCancel(templateObj)) return cancel()

        template = templateObj.name

        if (typeof templateObj.logLevel === 'number') {
            logLevel = templateObj.logLevel
        }

        if (templateObj.validators) {
            const validatorObj = await prompts.select({
                message: 'Select a schema validator:',
                options: templateObj.validators.map((t) => {
                    const validatorColor = t.color
                    return {
                        label: validatorColor(t.display || t.name),
                        value: t,
                    }
                }),
            })
            if (prompts.isCancel(validatorObj)) return cancel()
            
            validator = validatorObj.name
        }
    }

    const root = path.join(cwd, targetDir)
    fs.mkdirSync(root, { recursive: true })

    const pkgManager = pkgInfo ? pkgInfo.name : 'npm'

    prompts.log.step(`Scaffolding project in ${root}...`)

    const templateDir = path.resolve(
        fileURLToPath(import.meta.url),
        '..',
        'templates',
        `${template}`,
    )

    // copy template files
    if (validator) {
        const commonsDir = path.resolve(templateDir, 'commons')
        const validatorDir = path.resolve(templateDir, validator)

        fs.cpSync(commonsDir, root, { recursive: true })
        fs.cpSync(validatorDir, root, { recursive: true })
    } else {
        fs.cpSync(templateDir, root, { recursive: true })
    }

    // create package.json
    const packageJsonContent = {
        "name": `${packageName}`,
        "version": "1.0.0",
        "description": `${argDescription || ''}`,
        "author": `${argAuthor || ''}`,
        "license": `${argLicense || 'UNLICENSED'}`,
        "private": true,
        "scripts": {
            "build": "tsc",
            "dev": "nodemon",
            "lint": "eslint .",
            "start": "node dist/index.js",
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "dependencies": {}
    };
    if (template === 'wide' ||  template === 'advanced') {
        packageJsonContent.scripts['test'] = 'kaukau -r ts-node/register -f src --ext .spec.ts'
        packageJsonContent.scripts['test:e2e'] = 'kaukau --require ts-node/register --config test/kaukau-e2e.mjs'
    }
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJsonContent, null, '    '));

    // create config files
    let dotenvContent = 'PORT=8080\n'
    if (template != 'basic') {
        dotenvContent += `LOG_LEVEL=${logLevel}\n`
        dotenvContent += 'LOG_DEBUG=\n'
    }
    fs.writeFileSync(path.join(root, '.env'), dotenvContent);
    fs.writeFileSync(path.join(root, '.gitignore'), gitignoreContent);
    fs.writeFileSync(path.join(root, 'nodemon.json'), JSON.stringify({
        "watch": [
            "src",
            ".env",
            ".env.development.local"
        ],
        "ext": "ts,json",
        "ignore": [
            "src/**/*.spec.ts"
        ],
        "exec": "dotenvx run -- ts-node ./src/index.ts"
    }, null, '    '));

    // install dependencies
    let addPkgsCommand = ''
    switch (pkgManager) {
        case 'yarn':
            addPkgsCommand = 'yarn add'
            break
        default:
            addPkgsCommand += `${pkgManager} i`
            break
    }
    let installCommands = `cd ${root} && \
    ${addPkgsCommand} @dotenvx/dotenvx @novice1/api-doc-generator @novice1/frame @novice1/logger @novice1/routing tslib && \
    ${addPkgsCommand} -D @eslint/eslintrc @eslint/js @stylistic/eslint-plugin-js @types/cors @types/express @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint@9 globals nodemon ts-node typescript typescript-eslint`;
    if (validator === 'zod') {
        installCommands += ` && \
        ${addPkgsCommand} zod@next @novice1/api-doc-zod-helper @novice1/validator-zod`
    } else if (validator === 'typebox') {
        installCommands += ` && \
        ${addPkgsCommand} @sinclair/typebox @novice1/api-doc-json-helper @novice1/validator-typebox`
    } else if (validator === 'ajv') {
        installCommands += ` && \
        ${addPkgsCommand} ajv @novice1/api-doc-json-helper @novice1/validator-json`
    } else {
        installCommands += ` && \
        ${addPkgsCommand} joi @novice1/validator-joi`
    }
    if (template === 'wide' || template === 'advanced') {
        installCommands += ` && \
        ${addPkgsCommand} -D @types/chai @types/mocha @types/supertest @types/swagger-ui-express chai eslint-plugin-mocha kaukau supertest`
    }
    
    const error = await new Promise((res) => {
        cp_exec(installCommands, (err) => {
            res(err)
        })
    }) 

    if (error) {
        throw error
    }

    let doneMessage = ''
    const cdProjectName = path.relative(cwd, root)
    doneMessage += `Done. Now run:\n`
    if (root !== cwd) {
        doneMessage += `\n  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName
            }`
    }
    switch (pkgManager) {
        case 'yarn':
            doneMessage += '\n  yarn dev'
            break
        default:
            doneMessage += `\n  ${pkgManager} run dev`
            break
    }
    prompts.outro(doneMessage)
}

/**
 * 
 * @param {string} targetDir 
 * @returns 
 */
function formatTargetDir(targetDir) {
    return targetDir.trim().replace(/\/+$/g, '')
}

/**
 * 
 * @param {string} projectName 
 * @returns 
 */
function isValidPackageName(projectName) {
    return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
        projectName,
    )
}

/**
 * 
 * @param {string} projectName 
 * @returns 
 */
function toValidPackageName(projectName) {
    return projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^[._]/, '')
        .replace(/[^a-z\d\-~]+/g, '-')
}

/**
 * 
 * @param {string} path 
 * @returns 
 */
function isEmpty(path) {
    const files = fs.readdirSync(path)
    return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

/**
 * 
 * @param {string} dir 
 * @returns 
 */
function emptyDir(dir) {
    if (!fs.existsSync(dir)) {
        return
    }
    for (const file of fs.readdirSync(dir)) {
        if (file === '.git') {
            continue
        }
        fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
    }
}

/**
 * 
 * @param {string} [userAgent] 
 * @returns 
 */
function pkgFromUserAgent(userAgent) {
    if (!userAgent) return undefined
    const pkgSpec = userAgent.split(' ')[0]
    const pkgSpecArr = pkgSpec.split('/')
    return {
        name: pkgSpecArr[0],
        version: pkgSpecArr[1],
    }
}

init().catch((e) => {
    console.error(e)
})