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

//! Benchmarks for Liquid filters
//!
//! Run with: cargo bench

use criterion::{black_box, criterion_group, criterion_main, Criterion};
use liquid_forge_native::*;

fn bench_handleize(c: &mut Criterion) {
    c.bench_function("handleize_simple", |b| {
        b.iter(|| handleize(black_box(Some("Hello World".to_string()))))
    });

    c.bench_function("handleize_complex", |b| {
        b.iter(|| {
            handleize(black_box(Some(
                "Ñoño & Friends - Café con Leche (Edición Especial)".to_string(),
            )))
        })
    });

    c.bench_function("handleize_long", |b| {
        let long_text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
                        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            .to_string();
        b.iter(|| handleize(black_box(Some(long_text.clone()))))
    });
}

fn bench_escape(c: &mut Criterion) {
    c.bench_function("escape_simple", |b| {
        b.iter(|| escape(black_box(Some("Hello World".to_string()))))
    });

    c.bench_function("escape_html", |b| {
        b.iter(|| {
            escape(black_box(Some(
                "<script>alert('XSS')</script>".to_string(),
            )))
        })
    });

    c.bench_function("escape_mixed", |b| {
        b.iter(|| {
            escape(black_box(Some(
                "Rock & Roll <strong>\"Music\"</strong> 'n' Fun".to_string(),
            )))
        })
    });
}

fn bench_truncate(c: &mut Criterion) {
    c.bench_function("truncate_short", |b| {
        b.iter(|| {
            truncate(
                black_box(Some("Short text".to_string())),
                black_box(Some(50)),
                black_box(None),
            )
        })
    });

    c.bench_function("truncate_long", |b| {
        let long_text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
                        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            .to_string();
        b.iter(|| {
            truncate(
                black_box(Some(long_text.clone())),
                black_box(Some(50)),
                black_box(Some("...".to_string())),
            )
        })
    });
}

fn bench_append(c: &mut Criterion) {
    c.bench_function("append_strings", |b| {
        b.iter(|| {
            append(
                black_box(Some("Hello".to_string())),
                black_box(Some(" World".to_string())),
            )
        })
    });

    c.bench_function("append_long", |b| {
        let base = "Lorem ipsum ".to_string();
        let suffix = "dolor sit amet".to_string();
        b.iter(|| {
            append(black_box(Some(base.clone())), black_box(Some(suffix.clone())))
        })
    });
}

fn bench_strip_html(c: &mut Criterion) {
    c.bench_function("strip_html_simple", |b| {
        b.iter(|| strip_html(black_box(Some("<p>Hello World</p>".to_string()))))
    });

    c.bench_function("strip_html_complex", |b| {
        let html = "<div class='container'><h1>Title</h1><p>Paragraph with <strong>bold</strong> \
                    and <em>italic</em> text.</p></div>"
            .to_string();
        b.iter(|| strip_html(black_box(Some(html.clone()))))
    });
}

criterion_group!(
    benches,
    bench_handleize,
    bench_escape,
    bench_truncate,
    bench_append,
    bench_strip_html
);
criterion_main!(benches);

