/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//! HTML manipulation filters.

/// Escapes HTML special characters.
///
/// Converts:
/// - `&` to `&amp;`
/// - `<` to `&lt;`
/// - `>` to `&gt;`
/// - `"` to `&quot;`
/// - `'` to `&#x27;`
///
/// # Arguments
///
/// * `text` - The text to escape
///
/// # Returns
///
/// HTML-safe string
///
/// # Examples
///
/// ```javascript
/// escape("<script>alert('XSS')</script>")
/// // "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;"
///
/// escape("Rock & Roll")
/// // "Rock &amp; Roll"
/// ```
#[napi]
pub fn escape(text: Option<String>) -> String {
    let text = match text {
        Some(t) if !t.is_empty() => t,
        _ => return String::new(),
    };

    // Fast path: check if escaping is needed
    if !text.contains(['&', '<', '>', '"', '\'']) {
        return text;
    }

    // Pre-allocate with extra capacity for escape sequences
    let mut result = String::with_capacity(text.len() + (text.len() / 4));

    for c in text.chars() {
        match c {
            '&' => result.push_str("&amp;"),
            '<' => result.push_str("&lt;"),
            '>' => result.push_str("&gt;"),
            '"' => result.push_str("&quot;"),
            '\'' => result.push_str("&#x27;"),
            _ => result.push(c),
        }
    }

    result
}

/// Strips HTML tags from a string.
///
/// # Arguments
///
/// * `text` - The HTML text
///
/// # Returns
///
/// Text without HTML tags
///
/// # Examples
///
/// ```javascript
/// stripHtml("<p>Hello <strong>World</strong></p>")
/// // "Hello World"
/// ```
#[napi]
pub fn strip_html(text: Option<String>) -> String {
    let text = match text {
        Some(t) if !t.is_empty() => t,
        _ => return String::new(),
    };

    let mut result = String::with_capacity(text.len());
    let mut inside_tag = false;
    let mut prev_was_space = false;

    for c in text.chars() {
        match c {
            '<' => inside_tag = true,
            '>' => {
                inside_tag = false;
                // Add space after tag if next char isn't already space
                if !prev_was_space && !result.is_empty() {
                    result.push(' ');
                    prev_was_space = true;
                }
            }
            _ if !inside_tag => {
                if c.is_whitespace() {
                    if !prev_was_space {
                        result.push(' ');
                        prev_was_space = true;
                    }
                } else {
                    result.push(c);
                    prev_was_space = false;
                }
            }
            _ => {}
        }
    }

    result.trim().to_string()
}

/// Removes newlines from a string.
///
/// # Arguments
///
/// * `text` - The text with newlines
///
/// # Returns
///
/// Text without newlines
///
/// # Examples
///
/// ```javascript
/// stripNewlines("Hello\nWorld\r\n!")
/// // "HelloWorld!"
/// ```
#[napi]
pub fn strip_newlines(text: Option<String>) -> String {
    let text = match text {
        Some(t) if !t.is_empty() => t,
        _ => return String::new(),
    };

    text.chars().filter(|c| *c != '\n' && *c != '\r').collect()
}

/// Replaces newlines with HTML `<br>` tags.
///
/// # Arguments
///
/// * `text` - The text with newlines
///
/// # Returns
///
/// Text with `<br>` tags
///
/// # Examples
///
/// ```javascript
/// newlineToBr("Hello\nWorld")
/// // "Hello<br>World"
/// ```
#[napi]
pub fn newline_to_br(text: Option<String>) -> String {
    let text = match text {
        Some(t) if !t.is_empty() => t,
        _ => return String::new(),
    };

    text.replace("\r\n", "<br>").replace(['\n', '\r'], "<br>")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escape() {
        assert_eq!(
            escape(Some("<script>alert('XSS')</script>".to_string())),
            "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;"
        );
        assert_eq!(escape(Some("Rock & Roll".to_string())), "Rock &amp; Roll");
        assert_eq!(escape(None), "");
    }

    #[test]
    fn test_strip_html() {
        assert_eq!(
            strip_html(Some("<p>Hello <strong>World</strong></p>".to_string())),
            "Hello World"
        );
        assert_eq!(
            strip_html(Some("<div>Test</div><span>Content</span>".to_string())),
            "Test Content"
        );
        assert_eq!(strip_html(None), "");
    }

    #[test]
    fn test_strip_newlines() {
        assert_eq!(
            strip_newlines(Some("Hello\nWorld\r\n!".to_string())),
            "HelloWorld!"
        );
        assert_eq!(strip_newlines(None), "");
    }

    #[test]
    fn test_newline_to_br() {
        assert_eq!(
            newline_to_br(Some("Hello\nWorld".to_string())),
            "Hello<br>World"
        );
        assert_eq!(
            newline_to_br(Some("Line1\r\nLine2\rLine3".to_string())),
            "Line1<br>Line2<br>Line3"
        );
        assert_eq!(newline_to_br(None), "");
    }
}
