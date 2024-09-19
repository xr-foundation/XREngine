
import assert from 'assert'
import {
  ASSETS_REGEX,
  BUILDER_CHART_REGEX,
  EMAIL_REGEX,
  GITHUB_URL_REGEX,
  INSTALLATION_SIGNED_REGEX,
  INVITE_CODE_REGEX,
  MAIN_CHART_REGEX,
  PHONE_REGEX,
  PROJECT_PUBLIC_REGEX,
  PROJECT_REGEX,
  PROJECT_THUMBNAIL_REGEX,
  PUBLIC_SIGNED_REGEX,
  USER_ID_REGEX,
  VALID_FILENAME_REGEX,
  VALID_HEIRARCHY_SEARCH_REGEX,
  VALID_PROJECT_NAME,
  VALID_SCENE_NAME_REGEX,
  WINDOWS_RESERVED_NAME_REGEX
} from '../src/regex'

describe('regex.test', () => {
  describe('INVALID_FILENAME_REGEX', () => {
    it('should not match invalid filenames', () => {
      const invalidFilenames = [
        'hello_world',
        'file<name',
        'email@example.com:80',
        'path/to/file',
        'back\\slash',
        'pipe|symbol',
        'question?mark',
        'asterisk*char',
        'control\0char',
        'another\ncontrol',
        'file name',
        '< tag >',
        'key : value',
        'quote " example',
        'path / to / file',
        'C:\\ path \\ to \\ file',
        'pipe | character',
        'question ? mark',
        'star * char'
      ]
      invalidFilenames.forEach((filename) => {
        assert.ok(!VALID_FILENAME_REGEX.test(filename), `Expected '${filename}' to be invalid`)
      })
    })

    it('should match valid filenames', () => {
      const validFilenames = [
        'helloworld',
        'filename',
        'emailexample.com',
        'pathtofile',
        'backslash',
        'pipesymbol',
        'questionmark',
        'asteriskchar',
        'controlchar',
        'anothercontrol'
      ]
      validFilenames.forEach((filename) => {
        assert.ok(VALID_FILENAME_REGEX.test(filename), `Expected '${filename}' to be valid`)
      })
    })
  })

  describe('HEIRARCHY_SEARCH_REPLACE_REGEX', () => {
    it('should replace special characters in search', () => {
      const escapeSpecialChars = (input) => {
        return input.replace(VALID_HEIRARCHY_SEARCH_REGEX, '\\$&')
      }

      const testCases = [
        { input: 'a.b', expected: 'a\\.b' },
        { input: 'a*b', expected: 'a\\*b' },
        { input: 'a+b', expected: 'a\\+b' },
        { input: 'a?b', expected: 'a\\?b' },
        { input: '^a', expected: '\\^a' },
        { input: 'a$b', expected: 'a\\$b' },
        { input: '(a)', expected: '\\(a\\)' },
        { input: 'a|b', expected: 'a\\|b' },
        { input: '[a]', expected: '\\[a\\]' },
        { input: 'a\\b', expected: 'a\\\\b' },
        { input: 'a.b*c+?^${}()|[]\\', expected: 'a\\.b\\*c\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\' },
        { input: 'abc', expected: 'abc' }
      ]

      testCases.forEach(({ input, expected }) => {
        it(`should escape special characters in "${input}" correctly`, function () {
          const escaped = escapeSpecialChars(input)
          assert.equal(escaped, expected, `Expected escaped ${input} string to match expected ${expected} value`)
        })
      })
    })
  })

  describe('WINDOWS_RESERVED_NAME_REGEX', () => {
    it('should match windows reserved names', () => {
      const reservedNames = ['CON', 'PrN', 'auX', 'NUL', 'COM0', 'com1', 'Com9', 'LPT0', 'LpT4', 'lPt9']
      reservedNames.forEach((filename) => {
        assert.ok(WINDOWS_RESERVED_NAME_REGEX.test(filename), `Expected '${filename}' to be windows reserved name`)
      })
    })

    it('should not match common filenames', () => {
      const validFilenames = [
        'helloworld',
        'filename',
        'emailexample.com',
        'pathtofile',
        'backslash',
        'pipesymbol',
        'questionmark',
        'asteriskchar',
        'controlchar',
        'anothercontrol'
      ]
      validFilenames.forEach((filename) => {
        assert.ok(!WINDOWS_RESERVED_NAME_REGEX.test(filename), `Expected '${filename}' to be valid filename`)
      })
    })
  })

  describe('VALID_SCENE_NAME_REGEX', () => {
    it('should match valid scene names', () => {
      const validSceneNames = ['A123', 'file-name', '12345', 'My-good-file']
      validSceneNames.forEach((filename) => {
        assert.ok(VALID_SCENE_NAME_REGEX.test(filename), `Expected '${filename}' to be valid scene names`)
      })
    })

    it('should not match invalid scene names', () => {
      const invalidSceneNames = [
        'A1',
        '-test',
        'invalid!',
        'very-long-string-that-is-definitely-not-going-to-match-the-regex-because-it-is-way-too-long-for-the-pattern',
        '--double-hyphen',
        '...',
        'underscore_in_between',
        'my-file_123'
      ]
      invalidSceneNames.forEach((filename) => {
        assert.ok(!VALID_SCENE_NAME_REGEX.test(filename), `Expected '${filename}' to be invalid scene names`)
      })
    })
  })

  describe('USER_ID_REGEX', () => {
    it('should match valid user Ids', () => {
      const positiveCases = [
        '123e4567-e89b-12d3-a456-426614174000',
        'abcdef01-2345-6789-abcd-ef0123456789',
        'ABCDEF01-2345-6789-ABCD-EF0123456789',
        'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        'ffffffff-ffff-ffff-ffff-ffffffffffff'
      ]
      positiveCases.forEach((userId) => {
        assert.match(userId, USER_ID_REGEX, `Expected '${userId}' to match USER_ID_REGEX`)
      })
    })

    it('should not match invalid user Ids', () => {
      const negativeCases = [
        '123e4567-e89b-12d3-a456-42661417400',
        '123e4567e89b12d3a456426614174000',
        '123e4567-e89b-12d3-a456-426614174000-',
        '-123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-4266141740000',
        '123e4567-e89b-12d3-g456-426614174000'
      ]
      negativeCases.forEach((userId) => {
        assert.doesNotMatch(userId, USER_ID_REGEX, `Expected '${userId}' to not match USER_ID_REGEX`)
      })
    })
  })

  describe('EMAIL_REGEX', () => {
    it('should match valid emails', () => {
      const positiveCases = [
        'simple@example.com',
        'very.common@example.com',
        'disposable.style.email.with+symbol@example.com',
        'other.email-with-hyphen@example.com',
        'fully-qualified-domain@example.com',
        'user.name+tag+sorting@example.com',
        'x@example.com',
        'example-indeed@strange-example.com',
        'mailhost!username@example.org',
        'user%example.com@example.org',
        'user-@example.org'
      ]

      positiveCases.forEach((email) => {
        assert.match(email, EMAIL_REGEX, `Expected '${email}' to match EMAIL_REGEX`)
      })
    })

    it('should not match invalid emails', () => {
      const negativeCases = [
        'plainaddress',
        '@missingusername.com',
        'username@.com.',
        '.username@yahoo.com',
        'username@yahoo.com.',
        'username@yahoo..com',
        'username@yahoo.c',
        'username@yahoo.corporate',
        'username@-example.com',
        'username@example.com-',
        'username@example..com',
        'username@111.222.333.44444',
        'username@example..com',
        'username@-example.com'
      ]
      negativeCases.forEach((email) => {
        assert.doesNotMatch(email, EMAIL_REGEX, `Expected '${email}' to not match EMAIL_REGEX`)
      })
    })
  })

  describe('PHONE_REGEX', () => {
    it('should match valid phone numbers', () => {
      const positiveCases = ['1234567890', '0987654321', '0000000000', '1111111111', '9999999999']

      positiveCases.forEach((phoneNo) => {
        assert.match(phoneNo, PHONE_REGEX, `Expected '${phoneNo}' to match PHONE_REGEX`)
      })
    })

    it('should not match invalid phone numbers', () => {
      const negativeCases = [
        '123456789',
        '12345678901',
        '12345abcde',
        '123 456 7890',
        '123-456-7890',
        '+1234567890',
        '0123456789a',
        'a123456789',
        '12345 67890',
        ``
      ]
      negativeCases.forEach((phoneNo) => {
        assert.doesNotMatch(phoneNo, PHONE_REGEX, `Expected '${phoneNo}' to not match PHONE_REGEX`)
      })
    })
  })

  describe('INVITE_CODE_REGEX', () => {
    it('should match valid invite codes', () => {
      const positiveCases = ['1a2b3c4d', 'A1B2C3D4', 'abcdef12', '12345678', 'ABCDEF12']

      positiveCases.forEach((inviteCode) => {
        assert.match(inviteCode, INVITE_CODE_REGEX, `Expected '${inviteCode}' to match INVITE_CODE_REGEX`)
      })
    })

    it('should not match invalid invite codes', () => {
      const negativeCases = [
        '1a2b3c4',
        '1a2b3c4d5',
        '1a2b3c4g',
        '1a2b 3c4d',
        '1a-2b-3c-4d',
        '1234abcd!',
        'GHIJKLMN',
        '123'
      ]
      negativeCases.forEach((inviteCode) => {
        assert.doesNotMatch(inviteCode, INVITE_CODE_REGEX, `Expected '${inviteCode}' to not match INVITE_CODE_REGEX`)
      })
    })
  })

  describe('GITHUB_URL_REGEX', () => {
    it('should match valid GitHub Repository URLs', () => {
      const positiveCases = [
        {
          url: 'git@github.com:user/repo.git',
          capturedGroup: 'user/repo'
        },
        {
          url: 'https://github.com/user/repo.git',
          capturedGroup: 'user/repo'
        },
        {
          url: 'git@github.com:user/repo',
          capturedGroup: 'user/repo'
        },
        {
          url: 'https://github.com/user/repo',
          capturedGroup: 'user/repo'
        },
        {
          url: 'git@github.com:username_123/repo-name.git',
          capturedGroup: 'username_123/repo-name'
        }
      ]

      positiveCases.forEach(({ url, capturedGroup }) => {
        const match = GITHUB_URL_REGEX.exec(url)
        assert.ok(match, `Expected '${url}' to match GITHUB_URL_REGEX`)
        assert.equal(match?.[1], capturedGroup, `Expected group '${capturedGroup}' in '${url}'. Found ${match?.[1]}`)
      })
    })

    it('should not match invalid GitHub Repository URLs', () => {
      const negativeCases = [
        'git@bitbucket.org:user/repo.git', // different domain
        'http://github.com/user/repo.git', // uses HTTP instead of HTTPS
        'git@github.comuser/repo.git', // missing colon
        'https://bitbucket.org/user/repo', // different domain
        'git@github.com:/user/repo.git', // extra colon
        'https://github.com:user/repo.git', // colon in HTTPS format
        'git://github.com/user/repo.git', // unsupported protocol
        'git@github.com:username/repo.', // ends with a dot instead of .git
        'https://github.com/username/repo.git/extra', // extra path segment
        'git@github.com:username' // missing repository name
      ]
      negativeCases.forEach((url) => {
        assert.doesNotMatch(url, GITHUB_URL_REGEX, `Expected '${url}' to not match GITHUB_URL_REGEX`)
      })
    })
  })

  describe('PUBLIC_SIGNED_REGEX', () => {
    it('should match valid public signed GitHub Repository URLs', () => {
      const positiveCases = [
        {
          url: 'https://username:password@github.com/owner/repo.git',
          owner: 'owner',
          repo: 'repo'
        },
        {
          url: 'https://user-name:pass-word@github.com/owner-name/repo-name.git',
          owner: 'owner-name',
          repo: 'repo-name'
        },
        {
          url: 'https://user_name:pass_word@github.com/owner_name/repo_name.git',
          owner: 'owner_name',
          repo: 'repo_name'
        },
        {
          url: 'https://user name:pass word@github.com/owner name/repo name.git',
          owner: 'owner name',
          repo: 'repo name'
        },
        {
          url: 'https://user123:pass123@github.com/owner123/repo123.git',
          owner: 'owner123',
          repo: 'repo123'
        },
        {
          url: 'https://user_name-123:pass_word-123@github.com/owner_name-123/repo_name-123.git',
          owner: 'owner_name-123',
          repo: 'repo_name-123'
        }
      ]

      positiveCases.forEach(({ url, owner, repo }) => {
        const match = PUBLIC_SIGNED_REGEX.exec(url)
        assert.ok(match, `Expected '${url}' to match PUBLIC_SIGNED_REGEX`)
        assert.equal(match?.[1], owner, `Expected owner '${owner}' in '${url}'. Found ${match?.[1]}`)
        assert.equal(match?.[2], repo, `Expected repo '${repo}' in '${url}'. Found ${match?.[2]}`)
      })
    })

    it('should not match invalid public signed GitHub Repository URLs', () => {
      const negativeCases = [
        'http://username:password@github.com/owner/repo.git', // uses HTTP instead of HTTPS
        'https://username:password@bitbucket.com/owner/repo.git', // different domain
        'https://username:password@github.com/owner/repo', // missing .git suffix
        'https://username:password@github.com/owner/repo/extra.git', // extra path segment
        'https://username:password@github.com//repo.git', // missing owner name
        'https://username:password@github.com/owner/.git', // missing repository name
        'https://username:password@github.com/owner', // missing repository name and .git
        'https://username@github.com/owner/repo.git', // missing password
        'https://:password@github.com/owner/repo.git', // missing username
        'https://username:password@github.com/owner/repo.git/extra' // extra path after .git
      ]
      negativeCases.forEach((url) => {
        assert.doesNotMatch(url, PUBLIC_SIGNED_REGEX, `Expected '${url}' to not match PUBLIC_SIGNED_REGEX`)
      })
    })
  })

  describe('INSTALLATION_SIGNED_REGEX', () => {
    it('should match valid Installation signed GitHub Repository URLs', () => {
      const positiveCases = [
        {
          url: 'https://oauth2:token123@github.com/owner/repo.git',
          owner: 'owner',
          repo: 'repo'
        },
        {
          url: 'https://oauth2:my-oauth-token@github.com/user-name/repository-name.git',
          owner: 'user-name',
          repo: 'repository-name'
        },
        {
          url: 'https://oauth2:abc_123@github.com/org_name/repo_name.git',
          owner: 'org_name',
          repo: 'repo_name'
        }
      ]

      positiveCases.forEach(({ url, owner, repo }) => {
        const match = INSTALLATION_SIGNED_REGEX.exec(url)
        assert.ok(match, `Expected '${url}' to match INSTALLATION_SIGNED_REGEX`)
        assert.equal(match?.[1], owner, `Expected owner '${owner}' in '${url}'. Found ${match?.[1]}`)
        assert.equal(match?.[2], repo, `Expected repo '${repo}' in '${url}'. Found ${match?.[2]}`)
      })
    })

    it('should not match invalid Installation signed GitHub Repository URLs', () => {
      const negativeCases = [
        'http://oauth2:token123@github.com/owner/repo.git', // uses HTTP instead of HTTPS
        'https://oauth2:token123@bitbucket.org/owner/repo.git', // different domain
        'https://oauth2:token123@github.com/owner/repo', // missing .git suffix
        'https://oauth2:token123@github.com/owner/repo/extra.git', // extra path segment
        'https://oauth2:token123@github.com//repo.git', // missing owner name
        'https://oauth2:token123@github.com/owner/.git', // missing repository name
        'https://oauth2:token123@github.com/owner', // missing repository name and .git
        'https://oauth2:token123@github.com/owner/repo/.git', // trailing slash after .git
        'https://oauth2:token123@github.com/owner/repo.git/extra' // extra path segment after .git
      ]
      negativeCases.forEach((url) => {
        assert.doesNotMatch(url, INSTALLATION_SIGNED_REGEX, `Expected '${url}' to not match INSTALLATION_SIGNED_REGEX`)
      })
    })
  })

  describe('ASSETS_REGEX', () => {
    it('should match assets URLs', () => {
      const positiveCases = [
        'https://example.com/projects/xrengine/default-project/assets/images/logo.png',
        'https://example.com/projects/xrengine/default-project/assets/animations/emotes.glb',
        'https://example.com/projects/xrengine/default-project/assets/animations/locomotion.glb'
      ]
      positiveCases.forEach((url) => {
        assert.match(url, ASSETS_REGEX, `Expected '${url}' to match ASSETS_REGEX`)
      })
    })

    it('should not match non-assets URLs', () => {
      const negativeCases = [
        'https://example.com/projects/xrengine/default-project/scene.json',
        'https://example.com/projects/xrengine/default-project/assets',
        'https://example.com/xrengine/default-project/assets/animations/emotes.glb'
      ]
      negativeCases.forEach((url) => {
        assert.doesNotMatch(url, ASSETS_REGEX, `Expected '${url}' to not match ASSETS_REGEX`)
      })
    })
  })

  describe('PROJECT_REGEX', () => {
    it('should match valid project paths', () => {
      const positiveCases = [
        'projects/xrengine/project123',
        'projects/xrengine/project-name',
        'projects/xrengine/project_name',
        'projects/project/123',
        'projects/project/abc_def'
      ]
      positiveCases.forEach((value) => {
        assert.match(value, PROJECT_REGEX, `Expected '${value}' to match PROJECT_REGEX`)
      })
    })

    it('should not match invalid project paths', () => {
      const negativeCases = [
        'projects/', // (missing project name)
        'projects' // (missing trailing slash and project name)
      ]
      negativeCases.forEach((value) => {
        assert.doesNotMatch(value, PROJECT_REGEX, `Expected '${value}' to not match PROJECT_REGEX`)
      })
    })
  })

  describe('PROJECT_PUBLIC_REGEX', () => {
    it('should match valid project paths', () => {
      const positiveCases = [
        'projects/xrengine/project123/public/',
        'projects/xrengine/project-name/public/',
        'projects/xrengine/project_name/public/',
        'projects/project/123/public/',
        'projects/project/abc_def/public/'
      ]
      positiveCases.forEach((value) => {
        assert.match(value, PROJECT_PUBLIC_REGEX, `Expected '${value}' to match PROJECT_PUBLIC_REGEX`)
      })
    })

    it('should not match invalid project paths', () => {
      const negativeCases = [
        'projects/xrengine/project123/public', // (missing trailing slash)
        'projects/xrengine/project-name/private/', // (incorrect folder private instead of public)
        'projects/xrengine/project$name/public/', // (contains invalid character $)
        'projects/xrengine/project-@name/public/', // (contains invalid character @)
        'projects/' // (missing project name and /public/)
      ]
      negativeCases.forEach((value) => {
        assert.doesNotMatch(value, PROJECT_PUBLIC_REGEX, `Expected '${value}' to not match PROJECT_PUBLIC_REGEX`)
      })
    })
  })

  describe('PROJECT_THUMBNAIL_REGEX', () => {
    it('should match valid project thumbnail paths', () => {
      const positiveCases = [
        'projects/xrengine/project123/thumbnails/',
        'projects/xrengine/project-name/thumbnails/',
        'projects/xrengine/project_name/thumbnails/',
        'projects/project/123/thumbnails/',
        'projects/project/abc_def/thumbnails/'
      ]
      positiveCases.forEach((value) => {
        assert.match(value, PROJECT_THUMBNAIL_REGEX, `Expected '${value}' to match PROJECT_THUMBNAIL_REGEX`)
      })
    })

    it('should not match invalid project thumbnail paths', () => {
      const negativeCases = [
        'projects/xrengine/project123/thumbnails', // (missing trailing slash)
        'projects/xrengine/project-name/private/', // (incorrect folder private instead of public)
        'projects/xrengine/project$name/thumbnails/', // (contains invalid character $)
        'projects/xrengine/project-@name/thumbnails/', // (contains invalid character @)
        'projects/' // (missing project name and /thumbnail/)
      ]
      negativeCases.forEach((value) => {
        assert.doesNotMatch(value, PROJECT_THUMBNAIL_REGEX, `Expected '${value}' to not match PROJECT_THUMBNAIL_REGEX`)
      })
    })
  })

  describe('VALID_PROJECT_NAME', () => {
    it('should match valid project names', () => {
      const positiveCases = [
        'example',
        'example-example',
        'example example',
        'example123',
        'example-example123',
        'example example 123',
        'example-example_123',
        'example example-123',
        'example-example_123',
        'example example_123'
      ]
      positiveCases.forEach((name) => {
        assert.match(name, VALID_PROJECT_NAME, `Expected '${name}' to match VALID_PROJECT_NAME`)
      })
    })

    it('should not match invalid project names', () => {
      const negativeCases = [
        ' word', // (leading space)
        'word@word' // (contains non-word character @)
      ]
      negativeCases.forEach((name) => {
        assert.doesNotMatch(name, VALID_PROJECT_NAME, `Expected '${name}' to not match VALID_PROJECT_NAME`)
      })
    })
  })

  describe('MAIN_CHART_REGEX', () => {
    it('should match valid charts', () => {
      const positiveCases = [
        {
          chart: 'xrengine-1.0.0',
          version: '1.0.0'
        },
        {
          chart: 'xrengine-10.11.12',
          version: '10.11.12'
        },
        {
          chart: 'xrengine-123.456.789',
          version: '123.456.789'
        },
        {
          chart: 'xrengine-0.0.1',
          version: '0.0.1'
        },
        {
          chart: 'xrengine-9.99.999',
          version: '9.99.999'
        }
      ]

      positiveCases.forEach(({ chart, version }) => {
        const matches = chart.matchAll(MAIN_CHART_REGEX)
        const matchesArray = Array.from(matches)
        assert.ok(matchesArray.length > 0, `Expected '${chart}' to match MAIN_CHART_REGEX`)

        for (const match of matchesArray) {
          assert.equal(match[1], version, `Expected version: ${version} in '${chart}'. Found ${match[1]}`)
        }
      })
    })

    it('should not match invalid charts', () => {
      const negativeCases = [
        'xrengine-1.0', // only two groups of digits
        'xrengine-1.0.a', // non-digit character in version
        'xrengine-1.0_0', // underscore instead of period
        'etheralengine-1.0.0', // misspelled prefix
        'xrengine 1.0.0', // space instead of hyphen
        'xrengine-.0.0', // missing first group of digits
        '1.0.0-xrengine' // version string not in the correct place
      ]
      negativeCases.forEach((chart) => {
        const matches = chart.matchAll(MAIN_CHART_REGEX)
        const matchesArray = Array.from(matches)
        assert.ok(matchesArray.length === 0, `Expected '${chart}' to not match MAIN_CHART_REGEX`)
      })
    })
  })

  describe('BUILDER_CHART_REGEX', () => {
    it('should match valid charts', () => {
      const positiveCases = [
        {
          chart: 'xrengine-builder-1.0.0',
          version: '1.0.0'
        },
        {
          chart: 'xrengine-builder-10.11.12',
          version: '10.11.12'
        },
        {
          chart: 'xrengine-builder-123.456.789',
          version: '123.456.789'
        },
        {
          chart: 'xrengine-builder-0.0.1',
          version: '0.0.1'
        },
        {
          chart: 'xrengine-builder-9.99.999',
          version: '9.99.999'
        }
      ]

      positiveCases.forEach(({ chart, version }) => {
        const matches = chart.matchAll(BUILDER_CHART_REGEX)
        const matchesArray = Array.from(matches)
        assert.ok(matchesArray.length > 0, `Expected '${chart}' to match BUILDER_CHART_REGEX`)

        for (const match of matchesArray) {
          assert.equal(match[1], version, `Expected version: ${version} in '${chart}'. Found ${match[1]}`)
        }
      })
    })

    it('should not match invalid charts', () => {
      const negativeCases = [
        'xrengine-builder-1.0', // only two groups of digits
        'xrengine-builder-1.0.a', // non-digit character in version
        'xrengine-builder-1.0_0', // underscore instead of period
        'etheralengine-1.0.0', // misspelled prefix
        'xrengine-builder 1.0.0', // space instead of hyphen
        'xrengine-builder-.0.0', // missing first group of digits
        '1.0.0-xrengine-builder' // version string not in the correct place
      ]
      negativeCases.forEach((chart) => {
        const matches = chart.matchAll(BUILDER_CHART_REGEX)
        const matchesArray = Array.from(matches)
        assert.ok(matchesArray.length === 0, `Expected '${chart}' to not match BUILDER_CHART_REGEX`)
      })
    })
  })
})
