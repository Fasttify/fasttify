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

//! Text manipulation filters.

use unicode_normalization::UnicodeNormalization;

/// Appends a string to another string.
///
/// # Arguments
///
/// * `input` - The base string (can be null/empty)
/// * `value` - The string to append (can be null/empty)
///
/// # Returns
///
/// The concatenated string
///
/// # Examples
///
/// ```javascript
/// append("Hello", " World") // "Hello World"
/// append(null, "World")      // "World"
/// append("Hello", null)      // "Hello"
/// ```
#[napi]
pub fn append(input: Option<String>, value: Option<String>) -> String {
    let base = input.unwrap_or_default();
    let append_val = value.unwrap_or_default();

    if base.is_empty() {
        return append_val;
    }
    if append_val.is_empty() {
        return base;
    }

    // Pre-allocate exact capacity to avoid reallocations
    let mut result = String::with_capacity(base.len() + append_val.len());
    result.push_str(&base);
    result.push_str(&append_val);
    result
}

/// Prepends a string to another string.
///
/// # Arguments
///
/// * `input` - The base string (can be null/empty)
/// * `value` - The string to prepend (can be null/empty)
///
/// # Returns
///
/// The concatenated string with value first
///
/// # Examples
///
/// ```javascript
/// prepend("World", "Hello ") // "Hello World"
/// prepend(null, "Hello")      // "Hello"
/// prepend("World", null)      // "World"
/// ```
#[napi]
pub fn prepend(input: Option<String>, value: Option<String>) -> String {
    let base = input.unwrap_or_default();
    let prepend_val = value.unwrap_or_default();

    if prepend_val.is_empty() {
        return base;
    }
    if base.is_empty() {
        return prepend_val;
    }

    // Pre-allocate exact capacity to avoid reallocations
    let mut result = String::with_capacity(prepend_val.len() + base.len());
    result.push_str(&prepend_val);
    result.push_str(&base);
    result
}

/// Converts a string into a URL-friendly slug (handle).
///
/// This function:
/// - Converts to lowercase
/// - Normalizes Unicode characters (NFD decomposition)
/// - Removes diacritics (accents)
/// - Replaces non-alphanumeric characters with hyphens
/// - Removes consecutive hyphens
/// - Trims leading/trailing hyphens
///
/// # Arguments
///
/// * `text` - The text to convert
///
/// # Returns
///
/// A URL-friendly slug
///
/// # Examples
///
/// ```javascript
/// handleize("Hello World!")          // "hello-world"
/// handleize("Ñoño & Friends")        // "nono-friends"
/// handleize("Café con leche")        // "cafe-con-leche"
/// handleize("  Multiple   Spaces  ") // "multiple-spaces"
/// ```
#[napi]
pub fn handleize(text: Option<String>) -> String {
    let text = match text {
        Some(t) if !t.is_empty() => t,
        _ => return String::new(),
    };

    // Convert to lowercase
    let text = text.to_lowercase();

    // Normalize Unicode (NFD) and filter out combining marks
    let normalized: String = text
        .nfd()
        .filter(|c| !unicode_normalization::char::is_combining_mark(*c))
        .collect();

    // Replace non-alphanumeric with hyphens
    let mut result = String::with_capacity(normalized.len());
    let mut prev_was_hyphen = false;

    for c in normalized.chars() {
        if c.is_ascii_alphanumeric() {
            result.push(c);
            prev_was_hyphen = false;
        } else if !prev_was_hyphen {
            result.push('-');
            prev_was_hyphen = true;
        }
    }

    // Trim leading/trailing hyphens
    result.trim_matches('-').to_string()
}

/// Truncates a string to a specified length, adding an ellipsis.
///
/// # Arguments
///
/// * `text` - The text to truncate
/// * `length` - Maximum length (default: 50)
/// * `truncate_string` - String to append when truncated (default: "...")
///
/// # Returns
///
/// The truncated string
///
/// # Examples
///
/// ```javascript
/// truncate("Hello World", 8)              // "Hello..."
/// truncate("Hello World", 8, "…")         // "Hello…"
/// truncate("Short", 50)                   // "Short"
/// ```
#[napi]
pub fn truncate(
    text: Option<String>,
    length: Option<u32>,
    truncate_string: Option<String>,
) -> String {
    let text = match text {
        Some(t) => t,
        None => return String::new(),
    };

    let max_length = length.unwrap_or(50) as usize;
    let ellipsis = truncate_string.unwrap_or_else(|| "...".to_string());

    // Super fast path for ASCII strings (most common case)
    if text.is_ascii() && ellipsis.is_ascii() {
        if text.len() <= max_length {
            return text;
        }
        let truncate_at = max_length.saturating_sub(ellipsis.len());
        let mut result = String::with_capacity(max_length);
        result.push_str(&text[..truncate_at.min(text.len())]);
        result.push_str(&ellipsis);
        return result;
    }

    // Slower path for UTF-8 strings
    let char_count = text.chars().count();
    if char_count <= max_length {
        return text;
    }

    let ellipsis_char_count = ellipsis.chars().count();
    let truncate_at = max_length.saturating_sub(ellipsis_char_count);

    let mut result = String::with_capacity(text.len());
    for (i, c) in text.chars().enumerate() {
        if i >= truncate_at {
            break;
        }
        result.push(c);
    }

    result.push_str(&ellipsis);
    result
}

/// Returns singular or plural form based on count.
///
/// # Arguments
///
/// * `count` - The count to check
/// * `singular` - The singular form
/// * `plural` - The plural form (optional, defaults to singular + "s")
///
/// # Returns
///
/// The appropriate form based on count
///
/// # Examples
///
/// ```javascript
/// pluralize(1, "item")           // "item"
/// pluralize(2, "item")           // "items"
/// pluralize(2, "box", "boxes")   // "boxes"
/// pluralize(0, "item")           // "items"
/// ```
#[napi]
pub fn pluralize(count: i32, singular: String, plural: Option<String>) -> String {
    if count == 1 {
        singular
    } else {
        plural.unwrap_or_else(|| format!("{}s", singular))
    }
}

/// Returns a default value if the input is null, undefined, or empty.
///
/// # Arguments
///
/// * `value` - The value to check
/// * `default_value` - The default value to return
///
/// # Returns
///
/// The original value or the default
///
/// # Examples
///
/// ```javascript
/// defaultValue(null, "N/A")      // "N/A"
/// defaultValue("", "N/A")        // "N/A"
/// defaultValue("Hello", "N/A")   // "Hello"
/// ```
#[napi]
pub fn default_value(value: Option<String>, default_value: String) -> String {
    match value {
        Some(v) if !v.is_empty() => v,
        _ => default_value,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_append() {
        assert_eq!(append(Some("Hello".to_string()), Some(" World".to_string())), "Hello World");
        assert_eq!(append(None, Some("World".to_string())), "World");
        assert_eq!(append(Some("Hello".to_string()), None), "Hello");
        assert_eq!(append(None, None), "");
    }

    #[test]
    fn test_prepend() {
        assert_eq!(prepend(Some("World".to_string()), Some("Hello ".to_string())), "Hello World");
        assert_eq!(prepend(None, Some("Hello".to_string())), "Hello");
        assert_eq!(prepend(Some("World".to_string()), None), "World");
    }

    #[test]
    fn test_handleize() {
        assert_eq!(handleize(Some("Hello World".to_string())), "hello-world");
        assert_eq!(handleize(Some("Ñoño & Friends".to_string())), "nono-friends");
        assert_eq!(handleize(Some("Café con leche".to_string())), "cafe-con-leche");
        assert_eq!(handleize(Some("  Multiple   Spaces  ".to_string())), "multiple-spaces");
        assert_eq!(handleize(Some("!!!Exclamation!!!".to_string())), "exclamation");
        assert_eq!(handleize(None), "");
    }

    #[test]
    fn test_truncate() {
        assert_eq!(
            truncate(Some("Hello World".to_string()), Some(8), None),
            "Hello..."
        );
        assert_eq!(
            truncate(Some("Short".to_string()), Some(50), None),
            "Short"
        );
        assert_eq!(
            truncate(Some("Hello World".to_string()), Some(8), Some("…".to_string())),
            "Hello W…"
        );
    }

    #[test]
    fn test_pluralize() {
        assert_eq!(pluralize(1, "item".to_string(), None), "item");
        assert_eq!(pluralize(2, "item".to_string(), None), "items");
        assert_eq!(pluralize(0, "item".to_string(), None), "items");
        assert_eq!(
            pluralize(2, "box".to_string(), Some("boxes".to_string())),
            "boxes"
        );
    }

    #[test]
    fn test_default_value() {
        assert_eq!(
            default_value(None, "N/A".to_string()),
            "N/A"
        );
        assert_eq!(
            default_value(Some("".to_string()), "N/A".to_string()),
            "N/A"
        );
        assert_eq!(
            default_value(Some("Hello".to_string()), "N/A".to_string()),
            "Hello"
        );
    }
}

